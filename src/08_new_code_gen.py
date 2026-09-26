import os
import re
import json
from typing import Any, Dict, Optional

from dotenv import load_dotenv
from supabase import create_client, Client


# ============================================================
# ENVIRONMENT
# ============================================================

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Your current Supabase table
SUPABASE_TABLE = os.getenv(
    "SUPABASE_STANDARD_MATERIAL_TABLE",
    "standard_material"
)


# ============================================================
# SUPABASE CLIENT
# ============================================================

_supabase_client: Optional[Client] = None


def get_supabase_client() -> Client:
    """
    Create and reuse the Supabase client.
    """

    global _supabase_client

    if _supabase_client is not None:
        return _supabase_client

    if not SUPABASE_URL:
        raise RuntimeError(
            "SUPABASE_URL is not set in the .env file."
        )

    if not SUPABASE_KEY:
        raise RuntimeError(
            "SUPABASE_KEY is not set in the .env file."
        )

    _supabase_client = create_client(
        SUPABASE_URL,
        SUPABASE_KEY
    )

    return _supabase_client


# ============================================================
# NMC CODE STATE
# ============================================================

# This state is intentionally kept at module level.
#
# Why?
#
# main.py may call:
#
#     run(pair1)
#     run(pair2)
#     run(pair3)
#
# If the generated NMC is not inserted into Supabase
# immediately, querying Supabase every time could return the
# same next number.
#
# Example:
#
# database -> NMC-VAL-001
#
# pair 1 -> NMC-VAL-002
# pair 2 -> NMC-VAL-002   <-- BUG
#
# This dictionary prevents that.
#
# After pair 1:
#
# {
#     "VAL": 3
# }
#
# pair 2 therefore receives NMC-VAL-003.
#
_NMC_CODE_STATE: Dict[str, int] = {}


# ============================================================
# TEXT NORMALIZATION
# ============================================================

def normalize_text(value: Any) -> str:
    """
    Normalize text for comparison.

    This is used for duplicate detection only.
    The original material description is still preserved
    in the output.
    """

    if value is None:
        return ""

    value = str(value).strip().lower()

    # Common terminology normalization
    value = value.replace(
        "stainless steel",
        "ss"
    )

    value = value.replace(
        "inches",
        "in"
    )

    value = value.replace(
        "inch",
        "in"
    )

    # Normalize whitespace
    value = re.sub(
        r"\s+",
        " ",
        value
    )

    # Normalize punctuation
    value = re.sub(
        r"[,\.;]+",
        " ",
        value
    )

    # Normalize whitespace again
    value = re.sub(
        r"\s+",
        " ",
        value
    )

    return value.strip()


# ============================================================
# ATTRIBUTE PARSING
# ============================================================

def parse_attributes(
    value: Any
) -> Dict[str, Any]:
    """
    Convert extracted attributes into a dictionary.

    Supports:
        - dict
        - JSON string
        - None
    """

    if value is None:
        return {}

    if isinstance(value, dict):
        return value

    if isinstance(value, str):

        try:
            parsed = json.loads(value)

            if isinstance(parsed, dict):
                return parsed

        except json.JSONDecodeError:
            pass

    return {}


# ============================================================
# PRODUCT TYPE
# ============================================================

def get_product_type(
    attributes: Dict[str, Any]
) -> str:

    product_type = attributes.get(
        "product_type",
        ""
    )

    return normalize_text(
        product_type
    )


# ============================================================
# CATEGORY / SUBCATEGORY
# ============================================================

def categorize_material(
    attributes: Dict[str, Any]
) -> Dict[str, str]:
    """
    Determine category, subcategory and material group.

    This is currently rule based.

    It can later be replaced with the project's
    standard classification system.
    """

    product_type = get_product_type(
        attributes
    )

    # --------------------------------------------------------
    # VALVES
    # --------------------------------------------------------

    if "valve" in product_type:

        if "ball" in product_type:
            subcategory = "Ball Valves"

        elif "gate" in product_type:
            subcategory = "Gate Valves"

        elif "globe" in product_type:
            subcategory = "Globe Valves"

        elif "butterfly" in product_type:
            subcategory = "Butterfly Valves"

        elif "check" in product_type:
            subcategory = "Check Valves"

        elif "needle" in product_type:
            subcategory = "Needle Valves"

        elif "plug" in product_type:
            subcategory = "Plug Valves"

        else:
            subcategory = "Other Valves"

        return {
            "category": "Valves",
            "subcategory": subcategory,
            "material_group": "Mechanical"
        }

    # --------------------------------------------------------
    # PUMPS
    # --------------------------------------------------------

    if "pump" in product_type:

        if "centrifugal" in product_type:
            subcategory = "Centrifugal Pumps"

        elif "submersible" in product_type:
            subcategory = "Submersible Pumps"

        else:
            subcategory = "Other Pumps"

        return {
            "category": "Pumps",
            "subcategory": subcategory,
            "material_group": "Mechanical"
        }

    # --------------------------------------------------------
    # FASTENERS
    # --------------------------------------------------------

    if (
        "bolt" in product_type
        or "nut" in product_type
        or "screw" in product_type
        or "fastener" in product_type
    ):

        if "bolt" in product_type:
            subcategory = "Bolts"

        elif "nut" in product_type:
            subcategory = "Nuts"

        elif "screw" in product_type:
            subcategory = "Screws"

        else:
            subcategory = "Fasteners"

        return {
            "category": "Fasteners",
            "subcategory": subcategory,
            "material_group": "Mechanical"
        }

    # --------------------------------------------------------
    # DEFAULT
    # --------------------------------------------------------

    return {
        "category": "Other",

        "subcategory": (
            product_type.title()
            if product_type
            else "Unclassified"
        ),

        "material_group": "Mechanical"
    }


# ============================================================
# NMC PREFIX
# ============================================================

def get_nmc_prefix(
    category: str
) -> str:
    """
    Convert material category into NMC prefix.

    Example:

        Valves -> VAL
        Pumps -> PMP
        Fasteners -> FST
    """

    prefix_map = {

        "Valves": "VAL",

        "Pumps": "PMP",

        "Fasteners": "FST",

        "Bearings": "BRG",

        "Motors": "MTR",

        "Electrical": "ELC",

        "Pipes": "PIP",

        "Fittings": "FIT",

        "Instruments": "INS",

        "Filters": "FLT",

        "Other": "OTH"
    }

    return prefix_map.get(
        category,
        "OTH"
    )


# ============================================================
# STANDARDIZED DESCRIPTION
# ============================================================

def build_standardized_description(
    material_description: str
) -> str:
    """
    For the current project stage, the original material
    description is used as the standardized description.

    This can later be replaced by the standardization/
    normalization logic.
    """

    if not material_description:
        return ""

    return material_description.strip()


# ============================================================
# STANDARDIZED SPECIFICATION
# ============================================================

def build_standardized_specification(
    technical_description: str
) -> Optional[str]:
    """
    For now, preserve the original technical description.
    """

    if not technical_description:
        return None

    return technical_description.strip()


# ============================================================
# EXISTING NMC SEARCH
# ============================================================

def find_existing_nmc(
    material_description: str,
    technical_description: str,
    category: str,
    subcategory: str
) -> Optional[Dict[str, Any]]:
    """
    Check whether an equivalent standard material already
    exists in Supabase.

    Current prototype matching logic:

        1. standardized_description
        2. standardized_specification
        3. category
        4. subcategory

    The comparison is performed after normalization.

    This is deliberately conservative so that two materials
    are not treated as duplicates merely because they belong
    to the same category.
    """

    client = get_supabase_client()

    description = normalize_text(
        material_description
    )

    specification = normalize_text(
        technical_description
    )

    if not description:
        return None

    # --------------------------------------------------------
    # Fetch candidate records by category/subcategory
    # --------------------------------------------------------
    #
    # We do the final comparison in Python because:
    #
    # "2 Inch SS304 Ball Valve"
    #
    # and
    #
    # "2 inch ss304 ball valve"
    #
    # should be treated as equivalent.
    #
    response = (
        client
        .table(SUPABASE_TABLE)
        .select(
            "standard_material_id,"
            "common_material_code,"
            "standardized_description,"
            "standardized_specification,"
            "uom,"
            "category,"
            "subcategory,"
            "material_group,"
            "status"
        )
        .eq(
            "category",
            category
        )
        .eq(
            "subcategory",
            subcategory
        )
        .limit(1000)
        .execute()
    )

    rows = response.data or []

    for row in rows:

        db_description = normalize_text(
            row.get(
                "standardized_description"
            )
        )

        db_specification = normalize_text(
            row.get(
                "standardized_specification"
            )
        )

        # ----------------------------------------------------
        # Description must match
        # ----------------------------------------------------

        if db_description != description:
            continue

        # ----------------------------------------------------
        # Specification handling
        # ----------------------------------------------------
        #
        # If both records have specifications,
        # require them to match.
        #
        # If one side has no specification, description
        # matching can still identify the existing material.
        # ----------------------------------------------------

        if (
            specification
            and db_specification
            and specification != db_specification
        ):
            continue

        return row

    return None


# ============================================================
# FIND NEXT NMC NUMBER
# ============================================================

def get_next_nmc_number(
    prefix: str
) -> int:
    """
    Find the next unused number for a prefix from Supabase.

    Example:

        existing:
            NMC-VAL-001
            NMC-VAL-002
            NMC-VAL-007

        returns:
            8
    """

    client = get_supabase_client()

    pattern = f"NMC-{prefix}-"

    response = (
        client
        .table(SUPABASE_TABLE)
        .select(
            "common_material_code"
        )
        .like(
            "common_material_code",
            f"{pattern}%"
        )
        .execute()
    )

    rows = response.data or []

    max_number = 0

    for row in rows:

        code = row.get(
            "common_material_code"
        )

        if not code:
            continue

        match = re.fullmatch(
            rf"NMC-{re.escape(prefix)}-(\d+)",
            str(code).strip().upper()
        )

        if not match:
            continue

        number = int(
            match.group(1)
        )

        if number > max_number:
            max_number = number

    return max_number + 1


# ============================================================
# GENERATE NMC CODE
# ============================================================

def generate_nmc_code(
    prefix: str
) -> str:
    """
    Generate a unique NMC code for the current Python
    process.

    The first request for a prefix checks Supabase.

    Subsequent requests use the locally reserved number.

    This prevents:

        material A -> NMC-VAL-001
        material B -> NMC-VAL-001

    within the same main.py execution.
    """

    # --------------------------------------------------------
    # First material using this prefix
    # --------------------------------------------------------

    if prefix not in _NMC_CODE_STATE:

        _NMC_CODE_STATE[prefix] = (
            get_next_nmc_number(
                prefix
            )
        )

    # --------------------------------------------------------
    # Allocate current number
    # --------------------------------------------------------

    number = _NMC_CODE_STATE[
        prefix
    ]

    # Immediately reserve the next number.
    _NMC_CODE_STATE[
        prefix
    ] = number + 1

    return (
        f"NMC-{prefix}-{number:03d}"
    )


# ============================================================
# UOM
# ============================================================

def infer_uom(
    attributes: Dict[str, Any]
) -> str:
    """
    Current prototype UOM inference.

    This can later be replaced with the project's
    standardized UOM mapping.
    """

    product_type = get_product_type(
        attributes
    )

    if (
        "valve" in product_type
        or "pump" in product_type
        or "motor" in product_type
        or "bolt" in product_type
        or "nut" in product_type
        or "screw" in product_type
    ):
        return "NOS"

    return "NOS"


# ============================================================
# BUILD EXISTING-MATERIAL RESULT
# ============================================================

def build_duplicate_result(
    material_id: str,
    existing: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Build the JSON result when the material already exists.
    """

    return {

        "material_id": material_id,

        "standard_material": {

            "common_material_code": existing.get(
                "common_material_code"
            ),

            "standardized_description": existing.get(
                "standardized_description"
            ),

            "standardized_specification": existing.get(
                "standardized_specification"
            ),

            "uom": existing.get(
                "uom"
            ),

            "category": existing.get(
                "category"
            ),

            "subcategory": existing.get(
                "subcategory"
            ),

            "material_group": existing.get(
                "material_group"
            )
        },

        "mapping": {

            "mapping_type": "DUPLICATE",

            "confidence": 0.96
        }
    }


# ============================================================
# BUILD NEW-MATERIAL RESULT
# ============================================================

def build_new_nmc_result(
    material_id: str,
    material_description: str,
    technical_description: str,
    attributes: Dict[str, Any],
    category_info: Dict[str, str]
) -> Dict[str, Any]:
    """
    Build JSON for a genuinely new material.
    """

    category = category_info[
        "category"
    ]

    subcategory = category_info[
        "subcategory"
    ]

    material_group = category_info[
        "material_group"
    ]

    prefix = get_nmc_prefix(
        category
    )

    common_material_code = (
        generate_nmc_code(
            prefix
        )
    )

    return {

        "material_id": material_id,

        "standard_material": {

            "common_material_code": (
                common_material_code
            ),

            "standardized_description": (
                build_standardized_description(
                    material_description
                )
            ),

            "standardized_specification": (
                build_standardized_specification(
                    technical_description
                )
            ),

            "uom": infer_uom(
                attributes
            ),

            "category": category,

            "subcategory": subcategory,

            "material_group": material_group
        },

        "mapping": {

            "mapping_type": "NEW_NMC",

            "confidence": 1.0
        }
    }


# ============================================================
# PROCESS ONE MATERIAL
# ============================================================

def process_material(
    material_id: str,
    material_description: str,
    technical_description: str,
    attributes: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Process one material independently.

    Flow:

        attributes
             ↓
        categorization
             ↓
        Supabase lookup
             ↓
        existing?
        /       \
      YES       NO
       ↓         ↓
    DUPLICATE   NEW_NMC
    """

    # --------------------------------------------------------
    # Categorize
    # --------------------------------------------------------

    category_info = categorize_material(
        attributes
    )

    category = category_info[
        "category"
    ]

    subcategory = category_info[
        "subcategory"
    ]

    # --------------------------------------------------------
    # Check existing NMC
    # --------------------------------------------------------

    existing = find_existing_nmc(

        material_description=(
            material_description
        ),

        technical_description=(
            technical_description
        ),

        category=category,

        subcategory=subcategory
    )

    # --------------------------------------------------------
    # Existing material
    # --------------------------------------------------------

    if existing:

        return build_duplicate_result(
            material_id=material_id,
            existing=existing
        )

    # --------------------------------------------------------
    # New material
    # --------------------------------------------------------

    return build_new_nmc_result(

        material_id=material_id,

        material_description=(
            material_description
        ),

        technical_description=(
            technical_description
        ),

        attributes=attributes,

        category_info=category_info
    )


# ============================================================
# PROCESS SPLINK PAIR
# ============================================================

def run(
    result: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Process one pair received from the decision layer.

    Expected input:

        {
            "left_product_id": ...,
            "left_material_desc": ...,
            "left_technical_desc": ...,
            "left_attributes": ...,

            "right_product_id": ...,
            "right_material_desc": ...,
            "right_technical_desc": ...,
            "right_attributes": ...,

            "splink_score": ...,
            "prototype_decision": ...
        }

    Both materials are checked independently against
    the existing NMC master.
    """

    # --------------------------------------------------------
    # LEFT MATERIAL
    # --------------------------------------------------------

    left_attributes = parse_attributes(
        result.get(
            "left_attributes"
        )
    )

    left_result = process_material(

        material_id=str(
            result.get(
                "left_product_id",
                ""
            )
        ),

        material_description=str(
            result.get(
                "left_material_desc",
                ""
            )
        ),

        technical_description=str(
            result.get(
                "left_technical_desc",
                ""
            )
        ),

        attributes=left_attributes
    )

    # --------------------------------------------------------
    # RIGHT MATERIAL
    # --------------------------------------------------------

    right_attributes = parse_attributes(
        result.get(
            "right_attributes"
        )
    )

    right_result = process_material(

        material_id=str(
            result.get(
                "right_product_id",
                ""
            )
        ),

        material_description=str(
            result.get(
                "right_material_desc",
                ""
            )
        ),

        technical_description=str(
            result.get(
                "right_technical_desc",
                ""
            )
        ),

        attributes=right_attributes
    )

    # ========================================================
    # FINAL OUTPUT
    # ========================================================

    output = {

        "source_pair": {

            "left_material_id": result.get(
                "left_product_id"
            ),

            "right_material_id": result.get(
                "right_product_id"
            ),

            "splink_score": result.get(
                "splink_score"
            ),

            "prototype_decision": result.get(
                "prototype_decision"
            )
        },

        "results": [

            left_result,

            right_result

        ]
    }

    return output