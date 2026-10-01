import os
import importlib.util


# ============================================================
# LOAD DOWNSTREAM MODULES
# ============================================================

CURRENT_DIR = os.path.dirname(
    os.path.abspath(__file__)
)


def load_local_module(filename, module_name):

    path = os.path.join(
        CURRENT_DIR,
        filename
    )

    spec = importlib.util.spec_from_file_location(
        module_name,
        path
    )

    if spec is None or spec.loader is None:
        raise ImportError(
            f"Could not load module: {filename}"
        )

    module = importlib.util.module_from_spec(
        spec
    )

    spec.loader.exec_module(module)

    return module


human_eval_module = load_local_module(
    "07_human_eval.py",
    "human_eval"
)

new_code_module = load_local_module(
    "08_new_code_gen.py",
    "new_code_gen"
)

std_desc_module = load_local_module(
    "09_std_desc_llm.py",
    "std_desc_llm"
)


# ============================================================
# ROUTE ONE RESULT
# ============================================================

def route_result(result):
    """
    Routes one result according to its prototype decision.
    """

    decision = result.get(
        "prototype_decision"
    )
    print("\n===================================")
    print("PROTOTYPE DECISION:", decision)
    print("LEFT:", result.get("left_product_id"))
    print("RIGHT:", result.get("right_product_id"))
    print("===================================\n")

    # --------------------------------------------------------
    # Existing NMC
    # --------------------------------------------------------

    if decision == "NO NEW NMC CODE GENERATION":

        return std_desc_module.run(
            result
        )

    # --------------------------------------------------------
    # Human validation
    # --------------------------------------------------------

    elif decision == "HUMAN VALIDATION REQUIRED":
        
        updated_result = human_eval_module.run(
            result
        )
        
        """
        # Route the human-updated result again.
        return route_result(
            updated_result
        )
        """

    # --------------------------------------------------------
    # Generate new NMC
    # --------------------------------------------------------

    elif decision == "GENERATE NEW NMC":

        return new_code_module.run(
            result
        )

    else:

        raise ValueError(
            f"Unknown prototype decision: {decision}"
        )


# ============================================================
# PROCESS COMPLETE SPLINK OUTPUT
# ============================================================

def process_decisions(final_results):
    """
    Receives the complete output of 05_matching.py
    and processes every result sequentially.
    """

    results = []

    for _, row in final_results.iterrows():

        result = row.to_dict()

        try:

            processed_result = route_result(
                result
            )

            results.append(
                processed_result
            )

        except Exception as error:

            results.append(
                {
                    "status": "ERROR",
                    "error": str(error)
                }
            )

    return results