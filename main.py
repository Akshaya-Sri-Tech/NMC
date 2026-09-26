import json
import os
import importlib.util


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SRC_DIR = os.path.join(BASE_DIR, "src")


def load_module(filename):

    path = os.path.join(SRC_DIR, filename)

    module_name = filename.replace(".py", "").replace("-", "_")

    spec = importlib.util.spec_from_file_location(
        module_name,
        path
    )

    if spec is None or spec.loader is None:
        raise ImportError(
            f"Could not load module: {filename}"
        )

    module = importlib.util.module_from_spec(spec)

    spec.loader.exec_module(module)

    return module


def main():

    # ============================================================
    # STEP 1: LOAD PIPELINE MODULES
    # ============================================================

    ingestion = load_module("00_ingestion.py")
    cleaning = load_module("01_cleaning.py")
    normalization = load_module("02_normalization.py")
    extraction = load_module("03_attribute_extraction.py")
    dqc = load_module("04_data_quality.py")
    matching = load_module("05_matching.py")


    # ============================================================
    # STEP 2: LOAD RAW JSON
    # ============================================================

    raw_records = ingestion.load_sample_json()


    # ============================================================
    # STEP 3: INGESTION
    # ============================================================

    df = ingestion.ingest(source="sample")


    # ============================================================
    # STEP 4: CLEANING
    # ============================================================

    df = cleaning.clean_dataframe(df)


    # ============================================================
    # STEP 5: NORMALIZATION
    # ============================================================

    df = normalization.normalize_dataframe(df)


    # ============================================================
    # STEP 6: ATTRIBUTE EXTRACTION + DQC
    # ============================================================

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


        # --------------------------------------------------------
        # ATTRIBUTE EXTRACTION
        # --------------------------------------------------------

        extracted_attributes = extraction.extract(
            extraction_text
        )


        # --------------------------------------------------------
        # DATA QUALITY CORRECTION
        # --------------------------------------------------------

        extracted_attributes = dqc.dqc_attributes(
            extracted_attributes,
            normalized_specification
        )


        # --------------------------------------------------------
        # RAW METADATA
        # --------------------------------------------------------

        raw = raw_records[index]


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


    # ============================================================
    # STEP 7: SPLINK MATCHING
    # ============================================================

    matching_results = matching.run_splink_pipeline(
        final_json
    )


   # ============================================================
# STEP 8: FINAL OUTPUT
# ============================================================

print("Matching and decision layer completed.")


if __name__ == "__main__":
    main()