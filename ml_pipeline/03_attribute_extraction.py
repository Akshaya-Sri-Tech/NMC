import os
import json
import re
from pathlib import Path

from dotenv import load_dotenv

try:
    from groq import Groq
except ImportError:
    Groq = None


# =========================================================
# PATHS
# =========================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent

REGISTRY_PATH = (
    PROJECT_ROOT
    / "registries"
    / "attribute_registry.json"
)


# =========================================================
# ENVIRONMENT
# =========================================================

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
MODEL_NAME = os.getenv(
    "GROQ_MODEL",
    "qwen/qwen3.8-27b"
)

client = None

if GROQ_API_KEY and Groq:

    client = Groq(
        api_key=GROQ_API_KEY
    )


# =========================================================
# DEFAULT REGISTRY
# =========================================================

DEFAULT_REGISTRY = {
    "terms": {
        "ss": "stainless steel",
        "ss304": "SS304",
        "ss316": "SS316",
        "ptfe": "PTFE",
        "rf": "raised face",
        "flg": "flanged",
        "flanged end": "flanged",
        "cl": "class",
        "sch": "schedule",
        "cs": "carbon steel",
        "ms": "mild steel"
    }
}


# =========================================================
# REGISTRY FUNCTIONS
# =========================================================

def load_registry():

    REGISTRY_PATH.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    if not REGISTRY_PATH.exists():

        save_registry(DEFAULT_REGISTRY)

        return DEFAULT_REGISTRY.copy()

    try:

        with open(
            REGISTRY_PATH,
            "r",
            encoding="utf-8"
        ) as file:

            registry = json.load(file)

    except (json.JSONDecodeError, OSError):

        save_registry(DEFAULT_REGISTRY)

        return DEFAULT_REGISTRY.copy()

    if "terms" not in registry:
        registry["terms"] = {}

    return registry


def save_registry(registry):

    with open(
        REGISTRY_PATH,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            registry,
            file,
            indent=2,
            ensure_ascii=False
        )


ATTRIBUTE_REGISTRY = load_registry()


# =========================================================
# HELPERS
# =========================================================

def clean_value(value):

    if value is None:
        return None

    value = str(value).strip()

    value = re.sub(
        r"\s+",
        " ",
        value
    )

    return value


def add_attribute(
    attributes,
    key,
    value
):

    value = clean_value(value)

    if value:
        attributes[key] = value


# =========================================================
# RULE-BASED EXTRACTION
# =========================================================

def rule_based_extract(text):

    attributes = {}

    text = text.lower()


    # -----------------------------------------------------
    # PRODUCT TYPE
    # -----------------------------------------------------

    product_patterns = [
        (r"\bball valve\b", "ball valve"),
        (r"\bgate valve\b", "gate valve"),
        (r"\bglobe valve\b", "globe valve"),
        (r"\bcheck valve\b", "check valve"),
        (r"\bbutterfly valve\b", "butterfly valve"),
        (r"\bpressure transmitter\b", "pressure transmitter"),
        (r"\bcentrifugal pump\b", "centrifugal pump"),
        (r"\bpump\b", "pump"),
        (r"\bbearing\b", "bearing"),
        (r"\bgasket\b", "gasket"),
        (r"\bbolt\b", "bolt"),
        (r"\bpipe\b", "pipe"),
        (r"\bcable\b", "cable"),
        (r"\bplate\b", "plate")
    ]

    for pattern, value in product_patterns:

        if re.search(pattern, text):

            add_attribute(
                attributes,
                "product_type",
                value
            )

            break


    # -----------------------------------------------------
    # SIZE
    # -----------------------------------------------------

    size_match = re.search(
        r"\b(\d+(?:\.\d+)?)\s*(?:inch|in)\b",
        text
    )

    if size_match:

        add_attribute(
            attributes,
            "size",
            f"{size_match.group(1)} inch"
        )


    # -----------------------------------------------------
    # BODY MATERIAL
    # -----------------------------------------------------

    body_material = re.search(
        r"\b(?:body\s+)?material\s*[:\-]?\s*"
        r"(ss\s*\d+|stainless\s+steel\s*\d+|"
        r"cs\s*\d+|carbon\s+steel\s*\d+)\b",
        text
    )

    if body_material:

        value = body_material.group(1)

        value = re.sub(
            r"\s+",
            "",
            value
        )

        value = value.upper()

        value = value.replace(
            "STAINLESSSTEEL",
            "SS"
        )

        value = value.replace(
            "CARBONSTEEL",
            "CS"
        )

        add_attribute(
            attributes,
            "body_material",
            value
        )

    else:

        ss_match = re.search(
            r"\bss\s*(304|316|321|347)\b",
            text
        )

        if ss_match:

            add_attribute(
                attributes,
                "body_material",
                f"SS{ss_match.group(1)}"
            )


    # -----------------------------------------------------
    # SEAT MATERIAL
    # -----------------------------------------------------

    seat_match = re.search(
        r"\bseat\s*(?:material)?\s*[:\-]?\s*"
        r"(ptfe|teflon|epdm|viton|nbr|graphite)\b",
        text
    )

    if seat_match:

        value = seat_match.group(1)

        seat_mapping = {
            "teflon": "PTFE",
            "ptfe": "PTFE",
            "epdm": "EPDM",
            "viton": "Viton",
            "nbr": "NBR",
            "graphite": "Graphite"
        }

        add_attribute(
            attributes,
            "seat_material",
            seat_mapping.get(
                value,
                value.upper()
            )
        )


    # -----------------------------------------------------
    # FLANGE RATING
    # -----------------------------------------------------

    class_match = re.search(
        r"\b(?:class|cl)\s*(\d+)\b",
        text
    )

    if class_match:

        add_attribute(
            attributes,
            "flange_rating",
            f"{class_match.group(1)}#"
        )


    # -----------------------------------------------------
    # PRESSURE
    # -----------------------------------------------------

    pressure_match = re.search(
        r"\b(\d+(?:\.\d+)?)\s*(bar|psi|mpa)\b",
        text
    )

    if pressure_match:

        add_attribute(
            attributes,
            "pressure",
            (
                f"{pressure_match.group(1)} "
                f"{pressure_match.group(2)}"
            )
        )


    # -----------------------------------------------------
    # SCHEDULE
    # -----------------------------------------------------

    schedule_match = re.search(
        r"\b(?:schedule|sch)\s*(\d+(?:\.\d+)?)\b",
        text
    )

    if schedule_match:

        add_attribute(
            attributes,
            "schedule",
            f"schedule {schedule_match.group(1)}"
        )


    # -----------------------------------------------------
    # MATERIAL GRADE
    # -----------------------------------------------------

    grade_match = re.search(
        r"\bgrade\s*([a-z0-9.\-]+)\b",
        text
    )

    if grade_match:

        add_attribute(
            attributes,
            "material_grade",
            grade_match.group(1).upper()
        )


    # -----------------------------------------------------
    # STANDARD
    # -----------------------------------------------------

    astm_match = re.search(
        r"\b(?:astm\s*)?(a\s*\d{3,4})\b",
        text
    )

    if astm_match:

        code = re.sub(
            r"\s+",
            "",
            astm_match.group(1)
        ).upper()

        add_attribute(
            attributes,
            "standard",
            f"ASTM {code}"
        )


    # -----------------------------------------------------
    # CONNECTION
    # -----------------------------------------------------

    if "flanged" in text or "flange" in text:

        add_attribute(
            attributes,
            "connection",
            "flanged"
        )

    elif "threaded" in text:

        add_attribute(
            attributes,
            "connection",
            "threaded"
        )

    elif "screwed" in text:

        add_attribute(
            attributes,
            "connection",
            "screwed"
        )


    # -----------------------------------------------------
    # VOLTAGE
    # -----------------------------------------------------

    voltage_match = re.search(
        r"\b(\d+(?:\.\d+)?)\s*(kv|kilovolt|v|volt)\b",
        text
    )

    if voltage_match:

        unit = voltage_match.group(2)

        unit_mapping = {
            "kv": "kV",
            "kilovolt": "kV",
            "v": "V",
            "volt": "V"
        }

        add_attribute(
            attributes,
            "voltage",
            (
                f"{voltage_match.group(1)} "
                f"{unit_mapping[unit]}"
            )
        )


    # -----------------------------------------------------
    # CURRENT
    # -----------------------------------------------------

    current_match = re.search(
        r"\b(\d+(?:\.\d+)?)\s*(ma|a|amp|amps|ampere)\b",
        text
    )

    if current_match:

        unit = current_match.group(2)

        unit_mapping = {
            "ma": "mA",
            "a": "A",
            "amp": "A",
            "amps": "A",
            "ampere": "A"
        }

        add_attribute(
            attributes,
            "current",
            (
                f"{current_match.group(1)} "
                f"{unit_mapping[unit]}"
            )
        )


    # -----------------------------------------------------
    # POWER
    # -----------------------------------------------------

    power_match = re.search(
        r"\b(\d+(?:\.\d+)?)\s*(kw|mw|w)\b",
        text
    )

    if power_match:

        unit = power_match.group(2)

        unit_mapping = {
            "kw": "kW",
            "mw": "MW",
            "w": "W"
        }

        add_attribute(
            attributes,
            "power",
            (
                f"{power_match.group(1)} "
                f"{unit_mapping[unit]}"
            )
        )


    # -----------------------------------------------------
    # FLOW RATE
    # -----------------------------------------------------

    flow_match = re.search(
        r"\b(?:flow|capacity)\s*[:\-]?\s*"
        r"(\d+(?:\.\d+)?)\s*"
        r"(m3/hr|m3/h|m³/hr|lpm|l/min)\b",
        text
    )

    if flow_match:

        unit = flow_match.group(2).replace(
            "m³",
            "m3"
        )

        add_attribute(
            attributes,
            "flow_rate",
            (
                f"{flow_match.group(1)} "
                f"{unit}"
            )
        )


    # -----------------------------------------------------
    # RANGE
    # -----------------------------------------------------

    range_match = re.search(
        r"\brange\s*[:\-]?\s*"
        r"(\d+(?:\.\d+)?)\s*"
        r"(?:-|to)\s*"
        r"(\d+(?:\.\d+)?)\s*"
        r"(bar|psi|mpa)\b",
        text
    )

    if range_match:

        add_attribute(
            attributes,
            "range",
            (
                f"{range_match.group(1)}-"
                f"{range_match.group(2)} "
                f"{range_match.group(3)}"
            )
        )


    # -----------------------------------------------------
    # ACCURACY
    # -----------------------------------------------------

    accuracy_match = re.search(
        r"\baccuracy\s*[:\-]?\s*"
        r"±?\s*(\d+(?:\.\d+)?)\s*%",
        text
    )

    if accuracy_match:

        add_attribute(
            attributes,
            "accuracy",
            f"{accuracy_match.group(1)}%"
        )


    # -----------------------------------------------------
    # IP RATING
    # -----------------------------------------------------

    ip_match = re.search(
        r"\bip\s*(\d{2})\b",
        text
    )

    if ip_match:

        add_attribute(
            attributes,
            "ip_rating",
            f"IP{ip_match.group(1)}"
        )


    # -----------------------------------------------------
    # INSULATION
    # -----------------------------------------------------

    insulation_terms = [
        "xlpe",
        "pvc",
        "rubber",
        "epdm"
    ]

    for term in insulation_terms:

        if re.search(
            rf"\b{re.escape(term)}\b",
            text
        ):

            add_attribute(
                attributes,
                "insulation",
                term.upper()
            )

            break


    # -----------------------------------------------------
    # DIMENSIONS
    # -----------------------------------------------------

    dimension_match = re.search(
        r"\b(\d+(?:\.\d+)?)\s*x\s*"
        r"(\d+(?:\.\d+)?)\s*x\s*"
        r"(\d+(?:\.\d+)?)\s*"
        r"(mm|millimetre|millimeter|cm|inch)\b",
        text
    )

    if dimension_match:

        add_attribute(
            attributes,
            "dimensions",
            (
                f"{dimension_match.group(1)} x "
                f"{dimension_match.group(2)} x "
                f"{dimension_match.group(3)} "
                f"{dimension_match.group(4)}"
            )
        )


    return attributes


# =========================================================
# AI EXTRACTION
# =========================================================

def ai_extract(text):

    if client is None:
        return {}

    prompt = f"""
You are an industrial material attribute extraction system.

Extract ONLY attributes explicitly present in the material text.

Rules:
1. Do not invent values.
2. Do not infer missing specifications.
3. Preserve numbers and engineering codes.
4. Return attribute values as strings.
5. Do not return true/false.
6. Do not return arrays or nested objects.
7. Return ONLY valid JSON.
8. Use concise attribute names.

Example:

Input:
Ball valve 2in class 150 flanged end ss316 body ptfe seat

Output:
{{
  "seat_material": "PTFE",
  "flange_rating": "150#",
  "size": "2 inch",
  "body_material": "SS316"
}}

Material:
{text}
"""

    try:

        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0
        )

        output = response.choices[0].message.content.strip()


        # ---------------------------------------------
        # Direct JSON
        # ---------------------------------------------

        try:

            result = json.loads(output)

            if isinstance(result, dict):
                return sanitize_ai_result(result)

        except json.JSONDecodeError:
            pass


        # ---------------------------------------------
        # Markdown JSON
        # ---------------------------------------------

        fenced = re.search(
            r"```(?:json)?\s*(\{.*?\})\s*```",
            output,
            re.DOTALL
        )

        if fenced:

            try:

                result = json.loads(
                    fenced.group(1)
                )

                if isinstance(result, dict):
                    return sanitize_ai_result(result)

            except json.JSONDecodeError:
                pass


        # ---------------------------------------------
        # JSON embedded in text
        # ---------------------------------------------

        raw = re.search(
            r"\{.*\}",
            output,
            re.DOTALL
        )

        if raw:

            try:

                result = json.loads(
                    raw.group(0)
                )

                if isinstance(result, dict):
                    return sanitize_ai_result(result)

            except json.JSONDecodeError:
                pass


    except Exception:
        return {}


    return {}


# =========================================================
# SANITIZE AI RESULT
# =========================================================

def sanitize_ai_result(result):

    cleaned = {}

    for key, value in result.items():

        # Ignore complex values
        if isinstance(value, (dict, list)):
            continue

        # Ignore booleans
        if isinstance(value, bool):
            continue

        if value is None:
            continue

        key = str(key).strip().lower()

        value = clean_value(value)

        if not key or not value:
            continue

        cleaned[key] = value

    return cleaned


# =========================================================
# MERGE AI + RULE EXTRACTION
# =========================================================

def merge_and_learn(
    deterministic,
    ai_result
):

    changed = False

    for key, value in ai_result.items():

        if isinstance(value, (dict, list, bool)):
            continue

        value = clean_value(value)

        if not value:
            continue

        # Rule-based extraction has priority
        if key not in deterministic:

            deterministic[key] = value

            changed = True

    return deterministic, changed


# =========================================================
# MAIN EXTRACTION FUNCTION
# =========================================================

def extract(text):

    if not text:
        return {}

    text = str(text).strip()

    if not text:
        return {}


    # -----------------------------------------------------
    # 1. Rule-based extraction
    # -----------------------------------------------------

    attributes = rule_based_extract(text)


    # -----------------------------------------------------
    # 2. AI extraction
    # -----------------------------------------------------

    if client is not None:

        ai_result = ai_extract(text)

        attributes, changed = merge_and_learn(
            attributes,
            ai_result
        )


        # -------------------------------------------------
        # 3. Persist AI-learned attributes
        # -------------------------------------------------

        if changed:

            for key, value in ai_result.items():

                if isinstance(
                    value,
                    (dict, list, bool)
                ):
                    continue

                registry_key = (
                    f"{key}:{str(value).lower()}"
                )

                ATTRIBUTE_REGISTRY[
                    "terms"
                ][registry_key] = {
                    "attribute": key,
                    "canonical": value
                }


            save_registry(
                ATTRIBUTE_REGISTRY
            )


    return attributes