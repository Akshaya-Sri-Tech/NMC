import json
import re

import duckdb
import pandas as pd

from splink import Linker, DuckDBAPI, SettingsCreator, block_on
import splink.comparison_library as cl
import splink.comparison_level_library as cll


# ============================================================
# NMC MATERIAL MATCHING - SPLINK 4 + DUCKDB
# ============================================================
#
# Pipeline:
# JSON
#   -> attribute/value normalization
#   -> DuckDB
#   -> blocking
#   -> attribute-level comparisons
#   -> Splink match probability
#   -> clustering
#   -> NMC decision
#
# IMPORTANT:
# DEMO_CALIBRATION=True is ONLY for this 5-record synthetic demo.
# For production, use representative data + u estimation + EM or
# labelled training. Do not copy the demo m/u values to production.
# ============================================================


# ============================================================
# STEP 1: VALUE NORMALIZATION
# ============================================================

def normalize_attribute_value(key, value):
    """Normalize common material-attribute variants to one representation."""

    if value is None:
        return None

    key = str(key).strip().lower()
    value = str(value).strip().lower()

    # General whitespace normalization
    value = re.sub(r"\s+", " ", value)

    # Material / text aliases
    value = value.replace("stainless steel", "ss")
    value = value.replace("ptfe", "ptfe")

    # Dimensions
    if key == "size":
        value = re.sub(r"\s*(inch|inches|in)\b", "in", value)
        value = value.replace(" ", "")
        return value

    # Flow-rate variants: 100m3/hr, 100 m3/h -> 100m3/h
    if key == "flow_rate":
        value = value.replace("per hour", "/h")
        value = value.replace("m3/hr", "m3/h")
        value = value.replace("m³/hr", "m3/h")
        value = value.replace("m³/h", "m3/h")
        value = re.sub(r"\s+", "", value)
        return value

    # Head variants: 60 meters -> 60m
    if key == "head":
        value = re.sub(r"\s*(meters?|metres?|m)\b", "m", value)
        value = value.replace(" ", "")
        return value

    # Capacity variants: 50 HP -> 50hp
    if key == "capacity":
        value = re.sub(r"\s*(horsepower|hp)\b", "hp", value)
        value = value.replace(" ", "")
        return value

    # Material / rating values
    if key in {
        "body_material",
        "seat_material",
        "flange_rating",
        "valve_type",
        "product_type",
    }:
        return value.replace(" ", " ").strip()

    return value.strip()


def normalize_extracted_attributes(raw_attributes):
    """
    Normalize attribute keys and values and return a canonical dictionary.
    JSON key order therefore does not affect the representation.
    """

    if not raw_attributes:
        return {}

    if isinstance(raw_attributes, str):
        raw_attributes = json.loads(raw_attributes)

    if not isinstance(raw_attributes, dict):
        return {}

    normalized = {}

    for key, value in raw_attributes.items():
        clean_key = str(key).strip().lower()
        clean_value = normalize_attribute_value(clean_key, value)

        if clean_value is not None:
            normalized[clean_key] = clean_value

    return normalized


def canonicalize_attributes(attributes):
    """Create the retained canonical key:value representation."""

    return " | ".join(
        f"{key}:{attributes[key]}"
        for key in sorted(attributes)
        if attributes[key] is not None
    )


# ============================================================
# STEP 2: INPUT JSON (DYNAMIC IN-MEMORY INPUT)
# ============================================================

def run_splink_pipeline(final_json):
    """
    Accepts final_json list of dicts directly from the upstream DQC step.
    """
    raw_cpse_json_data = final_json


    # ============================================================
    # STEP 3: FLATTEN JSON INTO SPLINK-READY RECORDS
    # ============================================================

    processed_records = []

    for record in raw_cpse_json_data:

        attrs = normalize_extracted_attributes(
            record.get("extracted_attributes", {})
        )

        product_type = attrs.get(
            "product_type",
            attrs.get("equipment_type")
        )

        processed_records.append(
            {
                "unique_id": str(record["product_id"]),
                "product_id": str(record["product_id"]),
                "unspsc_code": str(record["unspsc_code"]).strip(),
                "cpse_source": str(record["cpse_source"]).strip(),

                "product_type": product_type,

                # Material-defining attributes
                "size": attrs.get("size"),
                "body_material": attrs.get("body_material"),
                "seat_material": attrs.get("seat_material"),
                "flange_rating": attrs.get("flange_rating"),
                "valve_type": attrs.get("valve_type"),

                # Equipment-specific attributes
                "capacity": attrs.get("capacity"),
                "flow_rate": attrs.get("flow_rate"),
                "head": attrs.get("head"),

                "material_description": (
                    str(record["material_description"])
                    .strip()
                    .lower()
                ),

                "technical_description": (
                    str(record["technical_description"])
                    .strip()
                    .lower()
                ),

                "canonical_kv_text": canonicalize_attributes(attrs),

                "raw_attributes_json": json.dumps(
                    attrs,
                    sort_keys=True
                ),
            }
        )


    df_clean = pd.DataFrame(processed_records)


    # ============================================================
    # STEP 4: DUCKDB
    # ============================================================

    con = duckdb.connect(database=":memory:")

    con.register("df_raw_view", df_clean)

    con.execute(
        """
        CREATE TABLE cpse_materials AS
        SELECT
            unique_id,
            product_id,
            unspsc_code,
            cpse_source,
            product_type,

            size,
            body_material,
            seat_material,
            flange_rating,
            valve_type,

            capacity,
            flow_rate,
            head,

            material_description,
            technical_description,
            canonical_kv_text,
            raw_attributes_json

        FROM df_raw_view;
        """
    )


    # ============================================================
    # STEP 5: SPLINK COMPARISONS
    # ============================================================

    DEMO_CALIBRATION = True


    def demo_exact_material_attribute(column_name):
        """
        Comparison for a material attribute.

        NULL = neutral evidence.
        Exact = strong positive evidence.
        Else = strong negative evidence.

        This is important because many material attributes are
        category-specific. For example, valves have seat_material,
        while pumps do not. Missing pump/valve-specific attributes
        must NOT be treated as evidence of a mismatch.
        """

        return cl.CustomComparison(
            output_column_name=column_name,
            comparison_description=f"Material attribute: {column_name}",
            comparison_levels=[
                cll.NullLevel(column_name),

                cll.ExactMatchLevel(column_name).configure(
                    m_probability=0.97,
                    u_probability=0.05,
                    fix_m_probability=True,
                    fix_u_probability=True,
                ),

                cll.ElseLevel().configure(
                    m_probability=0.03,
                    u_probability=0.95,
                    fix_m_probability=True,
                    fix_u_probability=True,
                ),
            ],
        )


    # These are the actual material/equipment identity attributes.
    ATTRIBUTE_COLUMNS = [
        "product_type",
        "size",
        "body_material",
        "seat_material",
        "flange_rating",
        "capacity",
        "flow_rate",
        "head",
    ]


    if DEMO_CALIBRATION:

        # Option B: compare UNSPSC + each extracted structured attribute directly.
        # Descriptions remain in the raw data/output but do not affect Splink score.
        comparisons = [
            cl.ExactMatch("unspsc_code"),
            *[demo_exact_material_attribute(column) for column in ATTRIBUTE_COLUMNS],
        ]

    else:

        # Production structure: UNSPSC + each extracted structured attribute.
        comparisons = [
            cl.ExactMatch("unspsc_code"),
            *[cl.ExactMatch(column) for column in ATTRIBUTE_COLUMNS],
        ]


    # ============================================================
    # STEP 6: SPLINK SETTINGS
    # ============================================================

    settings = SettingsCreator(

        link_type="dedupe_only",

        # Candidate generation.
        #
        # Keep both rules as requested.
        #
        # Note: the second rule is a stricter subset of the first,
        # so UNSPSC-only already admits those candidates.
        blocking_rules_to_generate_predictions=[
            block_on("unspsc_code"),
            block_on("unspsc_code", "product_type"),
        ],

        comparisons=comparisons,

        # Prototype prior only.
        probability_two_random_records_match=0.4,

        retain_matching_columns=True,
        retain_intermediate_calculation_columns=True,

        additional_columns_to_retain=[
            "product_id",
            "cpse_source",
            "product_type",

            "size",
            "body_material",
            "seat_material",
            "flange_rating",
            "valve_type",

            "capacity",
            "flow_rate",
            "head",

            "raw_attributes_json",
        ],
    )


    # ============================================================
    # STEP 7: LINKER
    # ============================================================

    db_api = DuckDBAPI(connection=con)

    linker = Linker(
        "cpse_materials",
        settings,
        db_api=db_api,
    )


    # ============================================================
    # STEP 8: PREDICTION
    # ============================================================

    df_predictions = linker.inference.predict()


    # ============================================================
    # STEP 9: CLUSTER HIGH-CONFIDENCE MATCHES
    # ============================================================

    CLUSTER_THRESHOLD = 0.90

    df_clusters = (
        linker.clustering
        .cluster_pairwise_predictions_at_threshold(
            df_predictions,
            threshold_match_probability=CLUSTER_THRESHOLD,
        )
    )


    # ============================================================
    # STEP 10: EXPOSE SPLINK RESULTS TO DUCKDB
    # ============================================================

    df_predictions.as_duckdbpyrelation().create_view(
        "splink_predictions"
    )

    df_clusters.as_duckdbpyrelation().create_view(
        "splink_clusters"
    )


    # ============================================================
    # STEP 11: BUILD FINAL RESULT
    # ============================================================

    final_results = con.execute(
        f"""
        SELECT

            c_left.cluster_id AS cluster_id_left,
            c_right.cluster_id AS cluster_id_right,

            CASE
                WHEN c_left.cluster_id = c_right.cluster_id
                THEN TRUE
                ELSE FALSE
            END AS same_cluster,

            CASE
                WHEN p.match_probability > 0.90
                    THEN 'MATCH'
                WHEN p.match_probability >= 0.50
                    THEN 'HUMAN_VALIDATION'
                ELSE 'NEW_NMC_CODE'
            END AS prototype_decision,

            ROUND(p.match_probability, 4)
                AS splink_score,

            ROUND(p.match_weight, 2)
                AS splink_match_weight,

            l.product_id AS left_product_id,
            l.cpse_source AS left_cpse,
            l.unspsc_code AS left_unspsc,
            l.product_type AS left_product_type,
            l.material_description AS left_material_desc,
            l.technical_description AS left_technical_desc,
            l.raw_attributes_json AS left_attributes,

            r.product_id AS right_product_id,
            r.cpse_source AS right_cpse,
            r.unspsc_code AS right_unspsc,
            r.product_type AS right_product_type,
            r.material_description AS right_material_desc,
            r.technical_description AS right_technical_desc,
            r.raw_attributes_json AS right_attributes

        FROM splink_predictions p

        LEFT JOIN splink_clusters c_left
            ON p.unique_id_l = c_left.unique_id

        LEFT JOIN splink_clusters c_right
            ON p.unique_id_r = c_right.unique_id

        JOIN cpse_materials l
            ON p.unique_id_l = l.unique_id

        JOIN cpse_materials r
            ON p.unique_id_r = r.unique_id

        WHERE l.product_id < r.product_id

        ORDER BY
            splink_score DESC,
            left_product_id,
            right_product_id
        """
    ).df()


    # ============================================================
    # STEP 12: EXPORT
    # ============================================================

    output_file = "harmonized_material_clusters.json"

    final_results.to_json(
        output_file,
        orient="records",
        indent=2,
    )


    # ============================================================
    # STEP 13: VALIDATION OUTPUT
    # ============================================================

    print("\n" + "=" * 70)
    print("NMC SPLINK MATERIAL MATCHING")
    print("=" * 70)

    print(f"Input records       : {len(df_clean)}")
    candidate_count = con.execute("SELECT COUNT(*) FROM splink_predictions").fetchone()[0]
    print(f"Candidate pairs     : {candidate_count}")
    print(f"Cluster threshold   : {CLUSTER_THRESHOLD}")
    print(
        "Mode                : "
        + (
            "5-record DEMO CALIBRATION"
            if DEMO_CALIBRATION
            else "PRODUCTION MODEL"
        )
    )

    print("\n===== SPLINK MATCH RESULTS =====\n")

    print(
        final_results[
            [
                "cluster_id_left",
                "cluster_id_right",
                "same_cluster",
                "prototype_decision",
                "left_product_id",
                "right_product_id",
                "splink_score",
                "splink_match_weight",
            ]
        ].to_string(index=False)
    )

    print(f"\nSuccessfully exported: {output_file}")
    return final_results