import os
import json
import importlib.util
from dotenv import load_dotenv


# ============================================================
# PROJECT PATH
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SRC_DIR = os.path.join(BASE_DIR, "src")

load_dotenv(
    os.path.join(BASE_DIR, ".env"),
    override=True
)


# ============================================================
# MODULE LOADER
# ============================================================

def load_module(filename):

    path = os.path.join(SRC_DIR, filename)

    spec = importlib.util.spec_from_file_location(
        "test_nmc_module",
        path
    )

    if spec is None or spec.loader is None:
        raise ImportError(
            f"Could not load {filename}"
        )

    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)

    return module


# ============================================================
# TEST
# ============================================================

def main():

    print("\n" + "=" * 70)
    print("NMC STEP 6 -> STEP 8 TEST")
    print("=" * 70)

    # --------------------------------------------------------
    # STEP 6 SAMPLE OUTPUT
    #
    # This is what we are pretending Step 6 produced.
    # We are NOT importing 06_decision_layer.py here because
    # that module currently imports 07_human_eval.py and
    # triggers Groq during module loading.
    # --------------------------------------------------------

    step6_result = {

        "left_product_id": "TEST_VALVE_001",

        "left_material_desc":
            "2 Inch SS304 Ball Valve",

        "left_technical_desc":
            "2 INCH, SS304, CLASS 300",

        "left_attributes": {
            "product_type": "ball valve",
            "size": "2 inch",
            "body_material": "SS304",
            "seat_material": None,
            "flange_rating": "CLASS 300",
            "capacity": None,
            "flow_rate": None,
            "head": None
        },


        "right_product_id": "TEST_VALVE_002",

        "right_material_desc":
            "4 Inch WCB Gate Valve",

        "right_technical_desc":
            "4 INCH, WCB, CLASS 300",

        "right_attributes": {
            "product_type": "gate valve",
            "size": "4 inch",
            "body_material": "WCB",
            "seat_material": None,
            "flange_rating": "CLASS 300",
            "capacity": None,
            "flow_rate": None,
            "head": None
        },


        "splink_score": 0.42,

        "prototype_decision":
            "GENERATE NEW NMC"
    }


    print("\nSTEP 6 SAMPLE OUTPUT:")
    print(
        json.dumps(
            step6_result,
            indent=4
        )
    )


    # ========================================================
    # STEP 8
    # ========================================================

    print("\n" + "-" * 70)
    print("LOADING 08_new_code_gen.py")
    print("-" * 70)

    nmc_generator = load_module(
        "08_new_code_gen.py"
    )


    print("\nCalling Step 8...")

    result = nmc_generator.run(
        step6_result
    )


    # ========================================================
    # OUTPUT
    # ========================================================

    print("\n" + "=" * 70)
    print("STEP 8 OUTPUT")
    print("=" * 70)

    print(
        json.dumps(
            result,
            indent=4,
            ensure_ascii=False
        )
    )

    print("\n" + "=" * 70)
    print("TEST COMPLETED")
    print("=" * 70)


if __name__ == "__main__":
    main()