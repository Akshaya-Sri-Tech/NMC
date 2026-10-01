from pathlib import Path
import importlib.util
import json


# ============================================================
# PROJECT PATHS
# ============================================================

# aiml_service.py
#     ↓
# backend/
#     ↓
# SIH_99/
BASE_DIR = Path(__file__).resolve().parents[2]

# Actual AI/ML pipeline folder:
# SIH_99/src/
SRC_DIR = BASE_DIR / "ml_pipeline"


# ============================================================
# LOAD AI/ML MODULE
# ============================================================

def load_module(filename):

    path = SRC_DIR / filename

    module_name = filename.replace(".py", "").replace("-", "_")

    spec = importlib.util.spec_from_file_location(
        module_name,
        str(path)
    )

    if spec is None or spec.loader is None:
        raise ImportError(
            f"Could not load module: {filename}"
        )

    module = importlib.util.module_from_spec(spec)

    spec.loader.exec_module(module)

    return module


# ============================================================
# MAIN AI/ML PIPELINE
# ============================================================

def standardize_materials(records):

    # ========================================================
    # STEP 1: LOAD PIPELINE MODULES
    # ========================================================

    ingestion = load_module("00_ingestion.py")
    cleaning = load_module("01_cleaning.py")
    normalization = load_module("02_normalization.py")
    extraction = load_module("03_attribute_extraction.py")
    dqc = load_module("04_data_quality.py")
    matching = load_module("05_matching.py")

    # ========================================================
    # STEP 2: INGEST RECEIVED JSON
    # ========================================================

    df = ingestion.ingest_records(records)

    # ========================================================
    # STEP 3: CLEANING
    # ========================================================

    df = cleaning.clean_dataframe(df)

    # ========================================================
    # STEP 4: NORMALIZATION
    # ========================================================

    df = normalization.normalize_dataframe(df)

    # ========================================================
    # STEP 5: ATTRIBUTE EXTRACTION + DQC
    # ========================================================

    final_json = []

    for index, row in df.iterrows():

        normalized_description = row.get(
            "normalized_description",
            ""
        )

        normalized_specification = row.get(
            "normalized_specification",
            ""
        )

        extraction_text = (
            f"{normalized_description} "
            f"{normalized_specification}"
        ).strip()

        # ----------------------------------------------------
        # ATTRIBUTE EXTRACTION
        # ----------------------------------------------------

        extracted_attributes = extraction.extract(
            extraction_text
        )

        # ----------------------------------------------------
        # DATA QUALITY CHECK
        # ----------------------------------------------------

        extracted_attributes = dqc.dqc_attributes(
            extracted_attributes,
            normalized_specification
        )

        # ----------------------------------------------------
        # RAW MATERIAL INFORMATION
        # ----------------------------------------------------

        raw = records[index]

        final_json.append({

            "product_id": raw.get(
                "material_id",
                ""
            ),

            "unspsc_code": raw.get(
                "unspsc_code",
                ""
            ),

            "cpse_source": raw.get(
                "cpse_name",
                ""
            ),

            "material_description": raw.get(
                "material_description",
                ""
            ),

            "technical_description": raw.get(
                "specification",
                ""
            ),

            "extracted_attributes": extracted_attributes
        })

    # ========================================================
    # STEP 6: SPLINK MATCHING
    # ========================================================

    matching_results = matching.run_splink_pipeline(
        final_json
    )

    # ========================================================
    # DEBUG OUTPUT
    # ========================================================

    print(
        json.dumps(
            matching_results,
            indent=4,
            ensure_ascii=False
        )
    )

    # ========================================================
    # STEP 7: RETURN RESULT
    # ========================================================

    if matching_results is None:
        return []

    return matching_results