import json
import os
import re
from pathlib import Path

import pandas as pd
from dotenv import load_dotenv


load_dotenv()


# ============================================================
# PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent

REGISTRY_FILE = (
    PROJECT_ROOT
    / "registries"
    / "normalization_registry.json"
)


# ============================================================
# AI CONFIGURATION
# ============================================================

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

GROQ_MODEL = os.getenv(
    "GROQ_MODEL",
    "qwen/qwen3-32b"
)


# ============================================================
# BASE NORMALIZATION REGISTRY
# ============================================================

DEFAULT_REGISTRY = {

    # Materials
    "ms": "mild steel",
    "m.s.": "mild steel",

    "ss": "stainless steel",
    "s.s.": "stainless steel",

    "cs": "carbon steel",
    "c.s.": "carbon steel",

    "ci": "cast iron",
    "c.i.": "cast iron",

    "gi": "galvanized iron",
    "g.i.": "galvanized iron",

    "al": "aluminium",
    "alu": "aluminium",

    "cu": "copper",

    # Components
    "plt": "plate",
    "pl": "plate",

    "tub": "tube",
    "tbg": "tubing",

    "flg": "flange",
    "elb": "elbow",

    "val": "valve",

    "assy": "assembly",
    "asmb": "assembly",

    # Engineering terms
    "thk": "thickness",
    "thkn": "thickness",

    "dia": "diameter",

    "od": "outside diameter",
    "id": "inside diameter",

    "lg": "length",
    "len": "length",

    "wd": "width",
    "wid": "width",

    "ht": "height",

    "sch": "schedule",

    "std": "standard",

    "spec": "specification",
    "specn": "specification",

    "fab": "fabricated",

    "mach": "machined",

    "galv": "galvanized",

    "hdg": "hot dip galvanized",

    "gr": "grade",

    "cl": "class",

    "rf": "raised face",

    # Units
    "mm": "millimetre",
    "cm": "centimetre",
    "m": "metre",

    "mtr": "metre",
    "meter": "metre",
    "metre": "metre",

    "in": "inch",
    "inch": "inch",

    "ft": "foot",

    "sqmm": "square millimetre",

    "kv": "kilovolt",
    "kw": "kilowatt",
    "mw": "megawatt",

    "hz": "hertz",

    "ma": "milliampere"
}


# ============================================================
# REGISTRY
# ============================================================

def load_registry():

    REGISTRY_FILE.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    if not REGISTRY_FILE.exists():

        with open(
            REGISTRY_FILE,
            "w",
            encoding="utf-8"
        ) as file:

            json.dump(
                DEFAULT_REGISTRY,
                file,
                indent=4
            )

        return DEFAULT_REGISTRY.copy()

    with open(
        REGISTRY_FILE,
        "r",
        encoding="utf-8"
    ) as file:

        registry = json.load(file)

    return registry


def save_registry(registry):

    REGISTRY_FILE.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    with open(
        REGISTRY_FILE,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            registry,
            file,
            indent=4,
            ensure_ascii=False
        )


REGISTRY = load_registry()


# ============================================================
# TOKENIZATION
# ============================================================

def tokenize(text):

    return re.findall(
        r"""
        [a-z]+(?:[-./][a-z]+)*
        \d+(?:\.\d+)?
        [a-z]+\d+(?:\.\d+)?
        \d+[a-z]+
        """,
        text,
        flags=re.IGNORECASE | re.VERBOSE
    )


# ============================================================
# ENGINEERING PATTERNS
# ============================================================

def normalize_engineering_tokens(text):

    # --------------------------------------------------------
    # SS304 / SS 304
    # --------------------------------------------------------

    text = re.sub(
        r"\bss\s*-?\s*(\d{3})\b",
        r"stainless steel \1",
        text
    )

    # --------------------------------------------------------
    # CS304 / CS 304
    # --------------------------------------------------------

    text = re.sub(
        r"\bcs\s*-?\s*(\d{3})\b",
        r"carbon steel \1",
        text
    )

    # --------------------------------------------------------
    # SCH40 / SCH 40
    # --------------------------------------------------------

    text = re.sub(
        r"\bsch\s*-?\s*(\d+)\b",
        r"schedule \1",
        text
    )

    # --------------------------------------------------------
    # CL300 / CL 300
    # --------------------------------------------------------

    text = re.sub(
        r"\bcl\s*-?\s*(\d+)\b",
        r"class \1",
        text
    )

    # --------------------------------------------------------
    # GR8.8 / GR 8.8
    # --------------------------------------------------------

    text = re.sub(
        r"\bgr\s*-?\s*(\d+(?:\.\d+)?)\b",
        r"grade \1",
        text
    )

    # --------------------------------------------------------
    # A106 / ASTM A106
    # --------------------------------------------------------

    text = re.sub(
        r"\b(?:astm\s+)?a\s*-?\s*(\d{3,4})\b",
        r"astm a\1",
        text
    )

    # --------------------------------------------------------
    # A312
    # --------------------------------------------------------

    text = re.sub(
        r"\b(?:astm\s+)?a\s*-?\s*(312)\b",
        r"astm a\1",
        text
    )

    # --------------------------------------------------------
    # TP316
    # --------------------------------------------------------

    text = re.sub(
        r"\btp\s*-?\s*(\d{3})\b",
        r"tp\1",
        text
    )

    # --------------------------------------------------------
    # 3C → 3 core
    # --------------------------------------------------------

    text = re.sub(
        r"\b(\d+)\s*c\b",
        r"\1 core",
        text
    )

    # --------------------------------------------------------
    # SQMM
    # --------------------------------------------------------

    text = re.sub(
        r"\b(\d+(?:\.\d+)?)\s*sq\s*mm\b",
        r"\1 square millimetre",
        text
    )

    # --------------------------------------------------------
    # KILOVOLT
    # --------------------------------------------------------

    text = re.sub(
        r"\b(\d+(?:\.\d+)?)\s*kv\b",
        r"\1 kilovolt",
        text
    )

    # --------------------------------------------------------
    # MILLIMETRE
    # --------------------------------------------------------

    text = re.sub(
        r"\b(\d+(?:\.\d+)?)\s*mm\b",
        r"\1 millimetre",
        text
    )

    # --------------------------------------------------------
    # INCH
    # --------------------------------------------------------

    text = re.sub(
        r"\b(\d+(?:\.\d+)?)\s*in\b",
        r"\1 inch",
        text
    )

    return text


# ============================================================
# REGISTRY TOKEN NORMALIZATION
# ============================================================

def normalize_registry_terms(text):

    global REGISTRY

    # Longest terms first
    terms = sorted(
        REGISTRY.keys(),
        key=len,
        reverse=True
    )

    for term in terms:

        pattern = (
            r"(?<![a-z0-9])"
            + re.escape(term)
            + r"(?![a-z0-9])"
        )

        replacement = REGISTRY[term]

        text = re.sub(
            pattern,
            replacement,
            text
        )

    return text


# ============================================================
# MATERIAL-SPECIFIC NORMALIZATION
# ============================================================

def normalize_material_text(text):

    if pd.isna(text):
        return ""

    text = str(text).lower().strip()

    # Engineering patterns FIRST
    text = normalize_engineering_tokens(text)

    # Registry abbreviations SECOND
    text = normalize_registry_terms(text)

    # Remove repeated spaces
    text = re.sub(
        r"\s+",
        " ",
        text
    ).strip()

    return text


# ============================================================
# AI NORMALIZATION
# ============================================================

def ai_normalize_terms(terms):

    if not terms:
        return {}

    if not GROQ_API_KEY:
        return {}

    try:

        from groq import Groq

        client = Groq(
            api_key=GROQ_API_KEY
        )

        prompt = f"""
You are an industrial material terminology normalization system.

Normalize ONLY the following unknown terminology.

Rules:
1. Do not change numbers.
2. Do not change engineering codes.
3. Do not invent specifications.
4. Do not merge unrelated terms.
5. Return one canonical English term for each input.
6. Keep technical meaning unchanged.
7. Return ONLY valid JSON.
8. Format:
{{
    "input": "canonical"
}}

Terms:
{json.dumps(terms)}
"""

        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0
        )

        content = response.choices[0].message.content.strip()

        content = re.sub(
            r"^```json\s*",
            "",
            content
        )

        content = re.sub(
            r"\s*```$",
            "",
            content
        )

        result = json.loads(content)

        if not isinstance(result, dict):
            return {}

        return result

    except Exception as error:

        print(
            f"\nAI normalization skipped: {error}"
        )

        return {}


# ============================================================
# FIND UNKNOWN TERMS
# ============================================================

def find_unknown_terms(text):

    terms = tokenize(text)

    unknown = []

    for term in terms:

        term = term.lower()

        # Known registry term
        if term in REGISTRY:
            continue

        # Numbers
        if re.fullmatch(
            r"\d+(?:\.\d+)?",
            term
        ):
            continue

        # Engineering codes
        if re.fullmatch(
            r"(?:ss|cs|a|tp|m|e)\d+(?:\.\d+)?",
            term
        ):
            continue

        # Already canonical multi-character words
        if term in {
            "stainless",
            "steel",
            "carbon",
            "mild",
            "bolt",
            "hex",
            "hexagonal",
            "valve",
            "pipe",
            "plate",
            "bearing",
            "pump",
            "cable",
            "gasket",
            "transmitter",
            "welding",
            "electrode",
            "ball",
            "gate",
            "deep",
            "groove",
            "power",
            "seamless",
            "hydraulic",
            "oil",
            "fluid",
            "pressure",
            "water",
            "centrifugal",
            "horizontal",
            "spiral",
            "wound",
            "graphite",
            "aluminium",
            "copper",
            "iron",
            "galvanized",
            "hot",
            "dip",
            "raised",
            "face",
            "full",
            "thread",
            "high",
            "tensile",
            "grade",
            "class",
            "schedule",
            "diameter",
            "length",
            "width",
            "height",
            "thickness",
            "specification",
            "standard",
            "assembly",
            "machined",
            "fabricated",
            "millimetre",
            "centimetre",
            "metre",
            "inch",
            "foot",
            "kilovolt",
            "kilowatt",
            "megawatt",
            "hertz",
            "milliampere",
            "square",
            "core",
            "astm",
            "aws",
            "hart",
            "npt",
            "iso",
            "vg",
            "rs"
        }:
            continue

        if term not in unknown:
            unknown.append(term)

    return unknown


# ============================================================
# NORMALIZE ONE TEXT FIELD
# ============================================================

def normalize_text(text):

    global REGISTRY

    if pd.isna(text):
        return ""

    text = str(text).lower().strip()

    # --------------------------------------------------------
    # STEP 1: Engineering normalization
    # --------------------------------------------------------

    text = normalize_engineering_tokens(text)

    # --------------------------------------------------------
    # STEP 2: Existing registry
    # --------------------------------------------------------

    text = normalize_registry_terms(text)

    # --------------------------------------------------------
    # STEP 3: Find unknown ordinary terminology
    # --------------------------------------------------------

    unknown_terms = find_unknown_terms(text)

    # --------------------------------------------------------
    # STEP 4: AI only for unknown terminology
    # --------------------------------------------------------

    if unknown_terms:

        ai_mappings = ai_normalize_terms(
            unknown_terms
        )

        if ai_mappings:

            changed = False

            for original, canonical in ai_mappings.items():

                original = str(
                    original
                ).lower().strip()

                canonical = str(
                    canonical
                ).lower().strip()

                if (
                    original
                    and canonical
                    and original != canonical
                ):

                    REGISTRY[original] = canonical

                    changed = True

            if changed:

                save_registry(
                    REGISTRY
                )

                text = normalize_registry_terms(
                    text
                )

    # --------------------------------------------------------
    # STEP 5: Final whitespace cleanup
    # --------------------------------------------------------

    text = re.sub(
        r"\s+",
        " ",
        text
    ).strip()

    return text


# ============================================================
# DATAFRAME NORMALIZATION
# ============================================================

def normalize_dataframe(df):

    normalized_df = df.copy()

    normalized_df[
        "normalized_description"
    ] = (
        normalized_df[
            "material_description"
        ]
        .apply(normalize_text)
    )

    normalized_df[
        "normalized_specification"
    ] = (
        normalized_df[
            "specification"
        ]
        .apply(normalize_text)
    )

    return normalized_df