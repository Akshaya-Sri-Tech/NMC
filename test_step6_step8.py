import os
import json
import importlib.util
import pandas as pd


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SRC_DIR = os.path.join(BASE_DIR, "src")


def load_module(filename, module_name):
    path = os.path.join(SRC_DIR, filename)

    spec = importlib.util.spec_from_file_location(
        module_name,
        path
    )

    if spec is None or spec.loader is None:
        raise ImportError(f"Could not load module: {filename}")

    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)

    return module


def main():

    # ============================================================
    # TEST ONLY
    # STEP 6 -> DECISION LAYER
    # STEP 8 -> NMC CODE GENERATION
    #
    # This file DOES NOT modify main.py.
    # It uses sample Splink-style results so you can test
    # the downstream flow independently of your real dataset.
    # ============================================================

    decision_layer = load_module(
        "06_decision_layer.py",
        "decision_layer_test"
    )

    nmc_generator = load_module(
        "08_new_code_gen.py",
        "nmc_generator_test"
    )

    # ------------------------------------------------------------
    # SAMPLE DATA
    #
    # These are intentionally different materials so that the
    # decision is in the NEW NMC path.
    # ------------------------------------------------------------

    sample_results = pd.DataFrame([
        {
            "cluster_id_left": 1,
            "cluster_id_right": 2,
            "same_cluster": False,

            "prototype_decision": "GENERATE NEW NMC",
            "splink_score": 0.42,
            "splink_match_weight": -1.5,

            "left_product_id": "TEST_VALVE_001",
            "left_cpse": "TEST_CPSE_A",
            "left_unspsc": "40141600",
            "left_material_desc": "2 Inch SS304 Ball Valve",
            "left_technical_desc": "2 INCH, SS304, CLASS 300",

            "left_attributes": json.dumps({
                "product_type": "ball valve",
                "size": "2 inch",
                "body_material": "SS304",
                "seat_material": None,
                "flange_rating": "CLASS 300",
                "capacity": None,
                "flow_rate": None,
                "head": None
            }),

            "right_product_id": "TEST_VALVE_002",
            "right_cpse": "TEST_CPSE_B",
            "right_unspsc": "40141600",
            "right_material_desc": "4 Inch WCB Gate Valve",
            "right_technical_desc": "4 INCH, WCB, CLASS 300",

            "right_attributes": json.dumps({
                "product_type": "gate valve",
                "size": "4 inch",
                "body_material": "WCB",
                "seat_material": None,
                "flange_rating": "CLASS 300",
                "capacity": None,
                "flow_rate": None,
                "head": None
            })
        }
    ])

    print("\n" + "=" * 70)
    print("TESTING STEP 6 + STEP 8")
    print("=" * 70)

    print("\nSTEP 6 INPUT:")
    print(sample_results.to_string(index=False))

    # ------------------------------------------------------------
    # STEP 6
    #
    # Use the actual decision-layer function.
    # If your current 06_decision_layer.py exposes
    # process_decisions(), this will execute it.
    # ------------------------------------------------------------

    print("\n" + "-" * 70)
    print("STEP 6: DECISION LAYER")
    print("-" * 70)

    decision_output = decision_layer.process_decisions(
        sample_results
    )

    print("\nSTEP 6 OUTPUT:")
    print(decision_output)

    # ------------------------------------------------------------
    # STEP 8
    #
    # The NMC generator expects ONE pair result at a time.
    # We therefore take the first decision-layer row and pass
    # exactly the fields expected by 08_new_code_gen.py.
    # ------------------------------------------------------------

    if isinstance(decision_output, pd.DataFrame):
        if decision_output.empty:
            print("\nNo rows returned by Step 6.")
            return

        row = decision_output.iloc[0].to_dict()

    elif isinstance(decision_output, list):
        if not decision_output:
            print("\nNo rows returned by Step 6.")
            return

        row = decision_output[0]

    elif isinstance(decision_output, dict):
        row = decision_output

    else:
        # If Step 6 only performs side effects and returns None,
        # use the original sample row for Step 8 testing.
        row = sample_results.iloc[0].to_dict()

    # Ensure the fields expected by 08_new_code_gen.py exist.
    step8_input = {
        "left_product_id": row.get(
            "left_product_id",
            "TEST_VALVE_001"
        ),
        "left_material_desc": row.get(
            "left_material_desc",
            "2 Inch SS304 Ball Valve"
        ),
        "left_technical_desc": row.get(
            "left_technical_desc",
            "2 INCH, SS304, CLASS 300"
        ),
        "left_attributes": row.get(
            "left_attributes",
            json.dumps({
                "product_type": "ball valve",
                "size": "2 inch",
                "body_material": "SS304",
                "seat_material": None,
                "flange_rating": "CLASS 300",
                "capacity": None,
                "flow_rate": None,
                "head": None
            })
        ),

        "right_product_id": row.get(
            "right_product_id",
            "TEST_VALVE_002"
        ),
        "right_material_desc": row.get(
            "right_material_desc",
            "4 Inch WCB Gate Valve"
        ),
        "right_technical_desc": row.get(
            "right_technical_desc",
            "4 INCH, WCB, CLASS 300"
        ),
        "right_attributes": row.get(
            "right_attributes",
            json.dumps({
                "product_type": "gate valve",
                "size": "4 inch",
                "body_material": "WCB",
                "seat_material": None,
                "flange_rating": "CLASS 300",
                "capacity": None,
                "flow_rate": None,
                "head": None
            })
        ),

        "splink_score": row.get(
            "splink_score",
            0.42
        ),

        "prototype_decision": row.get(
            "prototype_decision",
            "GENERATE NEW NMC"
        )
    }

    print("\n" + "-" * 70)
    print("STEP 8: NMC CODE GENERATION")
    print("-" * 70)

    print("\nSTEP 8 INPUT:")
    print(json.dumps(step8_input, indent=4))

    nmc_output = nmc_generator.run(step8_input)

    print("\nSTEP 8 OUTPUT:")
    print(
        json.dumps(
            nmc_output,
            indent=4,
            ensure_ascii=False
        )
    )

    print("\n" + "=" * 70)
    print("TEST COMPLETED")
    print("=" * 70)


if __name__ == "__main__":
    main()
