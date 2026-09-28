import os
import json
import re
import time
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from supabase import create_client, Client
from groq import Groq


# ============================================================
# ENVIRONMENT
# ============================================================

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

SUPABASE_STANDARD_MATERIAL_TABLE = os.getenv(
    "SUPABASE_STANDARD_MATERIAL_TABLE",
    "standard_material"
)

SUPABASE_MAPPING_TABLE = os.getenv(
    "SUPABASE_MAPPING_TABLE",
    "material_mapping"
)

SUPABASE_MATERIAL_TABLE = os.getenv(
    "SUPABASE_MATERIAL_TABLE",
    "material_master"
)

SUPABASE_MAPPING_STATUS = os.getenv(
    "SUPABASE_MAPPING_STATUS",
    "APPROVED"
)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Keep the same model configuration already used by the project.
# No GROQ_MODEL variable is required in .env.
GROQ_MODEL = "openai/gpt-oss-20b"


# ============================================================
# CLIENTS
# ============================================================

_supabase: Optional[Client] = None
_groq: Optional[Groq] = None


def get_supabase() -> Client:
    global _supabase

    if _supabase is not None:
        return _supabase

    if not SUPABASE_URL:
        raise RuntimeError("SUPABASE_URL is missing from .env")

    if not SUPABASE_KEY:
        raise RuntimeError("SUPABASE_KEY is missing from .env")

    _supabase = create_client(
        SUPABASE_URL,
        SUPABASE_KEY
    )

    return _supabase


def get_groq() -> Groq:
    global _groq

    if _groq is not None:
        return _groq

    if not GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY is missing from .env")

    _groq = Groq(
        api_key=GROQ_API_KEY,
        max_retries=2,
        timeout=90.0
    )

    return _groq


# ============================================================
# CACHES
# ============================================================

# pipeline product_id -> pipeline record
_pipeline_cache: Dict[str, Dict[str, Any]] = {}

# pipeline product_id -> resolved UUID, if one is actually known
_product_uuid_cache: Dict[str, Optional[str]] = {}

# UUID -> approved mapping information
_mapping_cache: Dict[str, Optional[Dict[str, Any]]] = {}

# standard_material_id -> list of material UUIDs
_nmc_material_cache: Dict[str, List[str]] = {}

# material UUID -> material_master row
_material_cache: Dict[str, Dict[str, Any]] = {}

# standard_material_id -> generated description
_description_cache: Dict[str, str] = {}


# ============================================================
# BASIC HELPERS
# ============================================================

def clean_text(value: Any) -> str:
    if value is None:
        return ""

    return re.sub(r"\s+", " ", str(value).strip())


def parse_json(value: Any) -> Any:
    if isinstance(value, (dict, list)):
        return value

    if not isinstance(value, str):
        return value

    try:
        return json.loads(value)
    except Exception:
        return value


# ============================================================
# SUPABASE RETRY
# ============================================================

def supabase_call(
    operation,
    label: str,
    retries: int = 3
):
    """
    Handles transient SSL/network errors such as:

        _ssl.c:989: The handshake operation timed out

    We retry only a small number of times.
    """

    last_error = None

    for attempt in range(retries):
        try:
            return operation()

        except Exception as error:
            last_error = error

            if attempt == retries - 1:
                break

            # 1 sec, then 2 sec
            time.sleep(attempt + 1)

    raise RuntimeError(
        f"Supabase request failed: {label}. "
        f"Last error: {last_error}"
    )


# ============================================================
# PIPELINE INPUT
# ============================================================

def find_pipeline_file() -> Optional[str]:
    """
    We use the existing pipeline input only to understand what
    product IDs such as a012 represent.

    This avoids changing matching.py.
    """

    possible_paths = [
        os.path.join(
            os.path.dirname(__file__),
            "..",
            "data",
            "sample",
            "sample_materials.json"
        ),

        os.path.join(
            os.getcwd(),
            "data",
            "sample",
            "sample_materials.json"
        ),

        os.path.join(
            os.getcwd(),
            "data",
            "sample_materials.json"
        )
    ]

    for path in possible_paths:
        path = os.path.abspath(path)

        if os.path.isfile(path):
            return path

    return None


def load_pipeline_materials() -> Dict[str, Dict[str, Any]]:
    """
    Loads:

        a001 -> complete pipeline record
        a002 -> complete pipeline record
        ...

    This is ONLY used to understand the pipeline material ID.

    It is NOT considered proof that material_code exists in
    Supabase material_master.
    """

    if _pipeline_cache:
        return _pipeline_cache

    path = find_pipeline_file()

    if not path:
        return {}

    try:
        with open(path, "r", encoding="utf-8") as file:
            data = json.load(file)

    except Exception:
        return {}

    if not isinstance(data, list):
        return {}

    for row in data:

        if not isinstance(row, dict):
            continue

        product_id = clean_text(
            row.get("material_id")
            or row.get("product_id")
        )

        if product_id:
            _pipeline_cache[product_id] = row

    return _pipeline_cache


def get_pipeline_material(
    product_id: str
) -> Optional[Dict[str, Any]]:

    materials = load_pipeline_materials()

    return materials.get(product_id)


# ============================================================
# UUID EXTRACTION
# ============================================================

def is_uuid(value: Any) -> bool:
    if not value:
        return False

    value = str(value).strip()

    pattern = (
        r"^[0-9a-fA-F]{8}-"
        r"[0-9a-fA-F]{4}-"
        r"[0-9a-fA-F]{4}-"
        r"[0-9a-fA-F]{4}-"
        r"[0-9a-fA-F]{12}$"
    )

    return bool(re.match(pattern, value))


def get_uuid_from_result(
    result: Dict[str, Any],
    side: str
) -> Optional[str]:

    """
    IMPORTANT:

    We first look for an actual UUID already present in the
    matching/decision result.

    We NEVER assume:

        a012 == UUID
        a012 == material_code

    """

    possible_fields = [
        f"{side}_material_id",
        f"{side}_uuid",
        f"{side}_master_id",
    ]

    for field in possible_fields:

        value = clean_text(result.get(field))

        if is_uuid(value):
            return value

    return None


# ============================================================
# OPTIONAL MASTER RESOLUTION
# ============================================================

def try_resolve_from_master(
    result: Dict[str, Any],
    side: str
) -> Optional[str]:

    """
    This is deliberately conservative.

    We only query material_master if the pipeline result actually
    contains a material_code that we can use.

    We do NOT throw an error if the code isn't present.

    Why?

    Because the pipeline sample material codes and the Supabase
    material_master codes may currently belong to different datasets.

    In that situation there is no legitimate UUID relationship for
    this module to invent.
    """

    pipeline_id = clean_text(
        result.get(f"{side}_product_id")
    )

    if not pipeline_id:
        return None

    if pipeline_id in _product_uuid_cache:
        return _product_uuid_cache[pipeline_id]

    pipeline_record = get_pipeline_material(pipeline_id)

    material_code = ""

    if pipeline_record:
        material_code = clean_text(
            pipeline_record.get("material_code")
        )

    # Future-compatible:
    # if matching.py ever passes material_code, use it.
    if not material_code:
        material_code = clean_text(
            result.get(f"{side}_material_code")
        )

    if not material_code:
        _product_uuid_cache[pipeline_id] = None
        return None

    client = get_supabase()

    try:

        response = supabase_call(
            lambda: (
                client
                .table(SUPABASE_MATERIAL_TABLE)
                .select("material_id,material_code")
                .eq("material_code", material_code)
                .limit(2)
                .execute()
            ),
            f"material_master lookup: {material_code}"
        )

    except Exception:
        # Do NOT kill the entire pipeline because of a lookup failure.
        _product_uuid_cache[pipeline_id] = None
        return None

    rows = response.data or []

    if len(rows) != 1:
        _product_uuid_cache[pipeline_id] = None
        return None

    material_id = clean_text(
        rows[0].get("material_id")
    )

    if not is_uuid(material_id):
        _product_uuid_cache[pipeline_id] = None
        return None

    _product_uuid_cache[pipeline_id] = material_id

    return material_id


def resolve_material_uuid(
    result: Dict[str, Any],
    side: str
) -> Optional[str]:

    """
    Resolution priority:

    1. Actual UUID supplied by the pipeline
    2. material_code -> material_master, IF that relationship exists
    3. Otherwise None

    No fabricated relationship.
    """

    direct_uuid = get_uuid_from_result(
        result,
        side
    )

    if direct_uuid:
        return direct_uuid

    return try_resolve_from_master(
        result,
        side
    )


# ============================================================
# MATERIAL MAPPING
# ============================================================

def get_approved_mapping(
    material_uuid: str
) -> Optional[Dict[str, Any]]:

    if material_uuid in _mapping_cache:
        return _mapping_cache[material_uuid]

    client = get_supabase()

    try:

        response = supabase_call(
            lambda: (
                client
                .table(SUPABASE_MAPPING_TABLE)
                .select(
                    "mapping_id,"
                    "material_id,"
                    "standard_material_id,"
                    "mapping_type,"
                    "confidence,"
                    "status"
                )
                .eq("material_id", material_uuid)
                .eq("status", SUPABASE_MAPPING_STATUS)
                .limit(1)
                .execute()
            ),
            f"material_mapping lookup: {material_uuid}"
        )

    except Exception:
        _mapping_cache[material_uuid] = None
        return None

    rows = response.data or []

    if not rows:
        _mapping_cache[material_uuid] = None
        return None

    mapping = rows[0]

    standard_material_id = clean_text(
        mapping.get("standard_material_id")
    )

    if not standard_material_id:
        _mapping_cache[material_uuid] = None
        return None

    # Fetch standard_material belonging to this mapping.
    try:

        standard_response = supabase_call(
            lambda: (
                client
                .table(SUPABASE_STANDARD_MATERIAL_TABLE)
                .select("*")
                .eq(
                    "standard_material_id",
                    standard_material_id
                )
                .limit(1)
                .execute()
            ),
            f"standard_material lookup: {standard_material_id}"
        )

    except Exception:
        _mapping_cache[material_uuid] = None
        return None

    standard_rows = standard_response.data or []

    if not standard_rows:
        _mapping_cache[material_uuid] = None
        return None

    output = {
        "mapping": mapping,
        "standard_material": standard_rows[0]
    }

    _mapping_cache[material_uuid] = output

    return output


# ============================================================
# FIND EXISTING NMC
# ============================================================

def find_existing_nmc(
    result: Dict[str, Any]
) -> Dict[str, Any]:

    """
    This is the CORE decision for std_desc_llm.

    material_mapping is the source of truth.

    We do NOT decide that an NMC exists merely because two materials
    matched in Splink.
    """

    resolved_material_ids: List[str] = []

    unresolved_products: List[str] = []

    for side in ("left", "right"):

        product_id = clean_text(
            result.get(f"{side}_product_id")
        )

        if not product_id:
            continue

        material_uuid = resolve_material_uuid(
            result,
            side
        )

        if material_uuid:

            if material_uuid not in resolved_material_ids:
                resolved_material_ids.append(material_uuid)

        else:

            unresolved_products.append(product_id)

    # --------------------------------------------------------
    # We cannot legitimately check material_mapping without UUID.
    # Return a clean status instead of throwing an error.
    # --------------------------------------------------------

    if not resolved_material_ids:

        return {
            "status": "PENDING_MAPPING",
            "reason": (
                "The matched pipeline materials could not be resolved "
                "to Supabase material UUIDs. No material_mapping lookup "
                "was attempted using pipeline IDs such as a012 because "
                "those IDs are not UUIDs."
            ),
            "pipeline_material_ids": unresolved_products
        }

    # --------------------------------------------------------
    # Check approved mappings.
    # --------------------------------------------------------

    found_mappings: List[Dict[str, Any]] = []

    for material_uuid in resolved_material_ids:

        mapping = get_approved_mapping(
            material_uuid
        )

        if mapping:
            found_mappings.append(mapping)

    # --------------------------------------------------------
    # No mapping = no existing NMC for this layer.
    # --------------------------------------------------------

    if not found_mappings:

        return {
            "status": "PENDING_MAPPING",
            "reason": (
                "No approved material_mapping record exists for the "
                "resolved material UUIDs. std_desc_llm will not call "
                "the LLM until an existing NMC mapping is available."
            ),
            "material_ids": resolved_material_ids
        }

    # --------------------------------------------------------
    # Make sure the matched materials don't point to different NMCs.
    # --------------------------------------------------------

    standard_material_ids = set()

    for item in found_mappings:

        standard_material = item.get(
            "standard_material",
            {}
        )

        standard_id = clean_text(
            standard_material.get(
                "standard_material_id"
            )
        )

        if standard_id:
            standard_material_ids.add(
                standard_id
            )

    if len(standard_material_ids) > 1:

        return {
            "status": "CONFLICTING_NMC_MAPPING",
            "reason": (
                "The matched materials are currently mapped to "
                "different standard_material records."
            ),
            "standard_material_ids": list(
                standard_material_ids
            ),
            "material_ids": resolved_material_ids
        }

    standard_material_id = next(
        iter(standard_material_ids)
    )

    standard_material = found_mappings[0][
        "standard_material"
    ]

    common_material_code = clean_text(
        standard_material.get(
            "common_material_code"
        )
    )

    return {
        "status": "FOUND",
        "standard_material_id": standard_material_id,
        "common_material_code": common_material_code,
        "standard_material": standard_material,
        "material_ids": resolved_material_ids
    }


# ============================================================
# FETCH ALL MATERIALS BELONGING TO NMC
# ============================================================

def fetch_all_mapped_material_ids(
    standard_material_id: str
) -> List[str]:

    if standard_material_id in _nmc_material_cache:
        return _nmc_material_cache[
            standard_material_id
        ]

    client = get_supabase()

    response = supabase_call(
        lambda: (
            client
            .table(SUPABASE_MAPPING_TABLE)
            .select("material_id")
            .eq(
                "standard_material_id",
                standard_material_id
            )
            .eq(
                "status",
                SUPABASE_MAPPING_STATUS
            )
            .execute()
        ),
        f"fetch all mappings for {standard_material_id}"
    )

    rows = response.data or []

    material_ids = []

    for row in rows:

        material_id = clean_text(
            row.get("material_id")
        )

        if material_id and material_id not in material_ids:
            material_ids.append(
                material_id
            )

    _nmc_material_cache[
        standard_material_id
    ] = material_ids

    return material_ids


# ============================================================
# FETCH MATERIAL MASTER RECORDS
# ============================================================

def fetch_material_records(
    material_ids: List[str]
) -> List[Dict[str, Any]]:

    if not material_ids:
        return []

    missing = [
        material_id
        for material_id in material_ids
        if material_id not in _material_cache
    ]

    if missing:

        client = get_supabase()

        response = supabase_call(
            lambda: (
                client
                .table(SUPABASE_MATERIAL_TABLE)
                .select("*")
                .in_(
                    "material_id",
                    missing
                )
                .execute()
            ),
            "fetch material_master records"
        )

        for row in response.data or []:

            material_id = clean_text(
                row.get("material_id")
            )

            if material_id:
                _material_cache[
                    material_id
                ] = row

    return [
        _material_cache[material_id]
        for material_id in material_ids
        if material_id in _material_cache
    ]


# ============================================================
# PREPARE LLM DATA
# ============================================================

def prepare_material(
    material: Dict[str, Any]
) -> Dict[str, Any]:

    attributes = (
        material.get("extracted_attributes")
        or material.get("attributes")
        or {}
    )

    attributes = parse_json(
        attributes
    )

    if not isinstance(attributes, dict):
        attributes = {}

    return {

        "material_code": clean_text(
            material.get("material_code")
        ),

        "material_description": clean_text(
            material.get("material_description")
        ),

        "technical_description": clean_text(
            material.get("technical_description")
            or material.get("specification")
        ),

        "uom": clean_text(
            material.get("uom")
        ),

        "category": clean_text(
            material.get("category")
        ),

        "subcategory": clean_text(
            material.get("subcategory")
        ),

        "material_group": clean_text(
            material.get("material_group")
        ),

        "unspsc_code": clean_text(
            material.get("unspsc_code")
        ),

        "attributes": attributes
    }


# ============================================================
# LLM PROMPT
# ============================================================

def build_prompt(
    nmc: str,
    materials: List[Dict[str, Any]]
) -> str:

    material_json = json.dumps(
        materials,
        indent=2,
        ensure_ascii=False
    )

    return f"""
You are a technical material master-data standardization system.

An existing Common National Material Code (NMC) has already been
approved for the following materials.

NMC:
{nmc}

Your task is ONLY to generate one standardized material description.

Rules:

1. Do NOT create a new NMC.
2. Do NOT change the NMC.
3. Do NOT decide whether these materials should belong together.
4. Use only information explicitly present in the supplied records.
5. Do not invent specifications.
6. Preserve important technical properties when consistently
   supported, such as:
   - product type
   - size
   - dimensions
   - material
   - grade
   - pressure/class/rating
   - schedule
   - capacity
   - relevant standard
7. Remove CPSE-specific wording.
8. Remove material IDs, legacy numbers, prices and procurement data.
9. Produce concise engineering-style wording.
10. If an attribute conflicts between records and cannot be safely
    resolved, omit that attribute.
11. Return ONLY JSON.

Required format:

{{
    "standardized_description": "..."
}}

MATERIALS:

{material_json}
"""


# ============================================================
# GROQ
# ============================================================

def generate_description(
    standard_material_id: str,
    common_material_code: str,
    materials: List[Dict[str, Any]]
) -> str:

    if standard_material_id in _description_cache:

        return _description_cache[
            standard_material_id
        ]

    if not materials:

        raise ValueError(
            "No mapped materials available for LLM."
        )

    client = get_groq()

    response = client.chat.completions.create(

        model=GROQ_MODEL,

        messages=[
            {
                "role": "system",
                "content": (
                    "You generate precise technical material "
                    "master descriptions. Return only JSON."
                )
            },

            {
                "role": "user",
                "content": build_prompt(
                    common_material_code,
                    materials
                )
            }
        ],

        temperature=0,

        response_format={
            "type": "json_object"
        }
    )

    content = (
        response
        .choices[0]
        .message
        .content
        or ""
    ).strip()

    try:

        data = json.loads(
            content
        )

    except json.JSONDecodeError:

        # Remove markdown fences if model added them.
        content = content.replace(
            "```json",
            ""
        ).replace(
            "```",
            ""
        ).strip()

        data = json.loads(
            content
        )

    description = clean_text(
        data.get(
            "standardized_description"
        )
    )

    if not description:

        raise ValueError(
            "Groq returned an empty standardized_description."
        )

    _description_cache[
        standard_material_id
    ] = description

    return description


# ============================================================
# UPDATE STANDARD MATERIAL
# ============================================================

def update_standard_material(
    standard_material_id: str,
    description: str
) -> Dict[str, Any]:

    client = get_supabase()

    response = supabase_call(
        lambda: (
            client
            .table(
                SUPABASE_STANDARD_MATERIAL_TABLE
            )
            .update({
                "standardized_description": description
            })
            .eq(
                "standard_material_id",
                standard_material_id
            )
            .execute()
        ),
        f"update standard_material {standard_material_id}"
    )

    rows = response.data or []

    # Some Supabase configurations don't return updated rows.
    if rows:
        return rows[0]

    verify = supabase_call(
        lambda: (
            client
            .table(
                SUPABASE_STANDARD_MATERIAL_TABLE
            )
            .select("*")
            .eq(
                "standard_material_id",
                standard_material_id
            )
            .limit(1)
            .execute()
        ),
        f"verify standard_material {standard_material_id}"
    )

    verified = verify.data or []

    if not verified:

        raise RuntimeError(
            "standard_material update could not be verified."
        )

    return verified[0]


# ============================================================
# MAIN ENTRY POINT
# ============================================================

def run(
    result: Dict[str, Any]
) -> Dict[str, Any]:

    """
    FINAL FLOW:

        MATCH
          ↓
        Resolve actual material UUID
          ↓
        material_mapping
          ↓
        Existing NMC?
          ↓
        YES
          ↓
        Fetch ALL materials mapped to NMC
          ↓
        Groq LLM
          ↓
        standardized_description
          ↓
        UPDATE standard_material

    If an actual UUID/mapping cannot be established:

        PENDING_MAPPING

    No fake material_code lookup.
    No fake UUID.
    No description-based guessing.
    """

    # --------------------------------------------------------
    # Check decision
    # --------------------------------------------------------

    decision = clean_text(
        result.get("prototype_decision")
    )

    if decision != "NO NEW NMC CODE GENERATION":

        return {
            "status": "SKIPPED",
            "reason": (
                "std_desc_llm received a decision other than "
                "'NO NEW NMC CODE GENERATION'."
            ),
            "decision": decision
        }

    # --------------------------------------------------------
    # Find existing NMC
    # --------------------------------------------------------

    nmc_info = find_existing_nmc(
        result
    )

    # --------------------------------------------------------
    # No usable mapping yet
    # --------------------------------------------------------

    if nmc_info["status"] != "FOUND":

        return nmc_info

    standard_material_id = nmc_info[
        "standard_material_id"
    ]

    common_material_code = nmc_info[
        "common_material_code"
    ]

    # --------------------------------------------------------
    # Fetch ALL materials mapped to NMC
    # --------------------------------------------------------

    material_ids = fetch_all_mapped_material_ids(
        standard_material_id
    )

    if not material_ids:

        return {
            "status": "PENDING_MAPPING",
            "reason": (
                f"NMC '{common_material_code}' exists, "
                "but no approved material_mapping rows were "
                "found for it."
            ),
            "standard_material_id": standard_material_id
        }

    # --------------------------------------------------------
    # Fetch material records
    # --------------------------------------------------------

    material_records = fetch_material_records(
        material_ids
    )

    if not material_records:

        return {
            "status": "PENDING_MAPPING",
            "reason": (
                "Approved mappings exist, but their material "
                "records could not be retrieved from "
                f"'{SUPABASE_MATERIAL_TABLE}'."
            ),
            "standard_material_id": standard_material_id,
            "common_material_code": common_material_code
        }

    # --------------------------------------------------------
    # Prepare LLM input
    # --------------------------------------------------------

    llm_materials = [
        prepare_material(record)
        for record in material_records
    ]

    # --------------------------------------------------------
    # Generate standardized description
    # --------------------------------------------------------

    standardized_description = generate_description(
        standard_material_id,
        common_material_code,
        llm_materials
    )

    # --------------------------------------------------------
    # Update standard_material
    # --------------------------------------------------------

    updated = update_standard_material(
        standard_material_id,
        standardized_description
    )

    # --------------------------------------------------------
    # FINAL SUCCESS
    # --------------------------------------------------------

    return {

        "status": "SUCCESS",

        "mapping_type": "EXISTING_NMC",

        "common_material_code": (
            common_material_code
        ),

        "standard_material_id": (
            standard_material_id
        ),

        "mapped_material_ids": (
            material_ids
        ),

        "mapped_material_count": (
            len(material_ids)
        ),

        "standardized_description": (
            standardized_description
        ),

        "standard_material": (
            updated
        )
    }


# ============================================================
# OPTIONAL DIRECT TEST
# ============================================================

if __name__ == "__main__":

    print(
        "std_desc_llm.py loaded successfully."
    )

    print(
        f"Standard material table : "
        f"{SUPABASE_STANDARD_MATERIAL_TABLE}"
    )

    print(
        f"Mapping table            : "
        f"{SUPABASE_MAPPING_TABLE}"
    )

    print(
        f"Material table           : "
        f"{SUPABASE_MATERIAL_TABLE}"
    )

    print(
        f"Mapping status           : "
        f"{SUPABASE_MAPPING_STATUS}"
    )

    print(
        "Waiting for run(result) from decision_layer.py..."
    )