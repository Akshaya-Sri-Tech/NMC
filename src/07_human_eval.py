import json
import os
import time
from groq import Groq


# ============================================================
# GROQ CLIENT
# ============================================================

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise RuntimeError(
        "GROQ_API_KEY environment variable is not set."
    )

client = Groq(
    api_key=api_key
)


# ============================================================
# HUMAN EVALUATION
# ============================================================

def run(result):


    # --------------------------------------------------------
    # Prepare LEFT record
    # --------------------------------------------------------

    left_record = {
        "product_id": result.get(
            "left_product_id"
        ),
        "cpse": result.get(
            "left_cpse"
        ),
        "unspsc": result.get(
            "left_unspsc"
        ),
        "material_description": result.get(
            "left_material_desc"
        ),
        "technical_description": result.get(
            "left_technical_desc"
        ),
        "attributes": result.get(
            "left_attributes"
        ),
    }

    # --------------------------------------------------------
    # Prepare RIGHT record
    # --------------------------------------------------------

    right_record = {
        "product_id": result.get(
            "right_product_id"
        ),
        "cpse": result.get(
            "right_cpse"
        ),
        "unspsc": result.get(
            "right_unspsc"
        ),
        "material_description": result.get(
            "right_material_desc"
        ),
        "technical_description": result.get(
            "right_technical_desc"
        ),
        "attributes": result.get(
            "right_attributes"
        ),
    }

    # --------------------------------------------------------
    # Prompt
    # --------------------------------------------------------

    prompt = f"""
You are analyzing two industrial material records
that have been flagged by a material matching system
for human validation.

Your task is ONLY to identify:

1. Similarities between the two records.
2. Differences between the two records.

Focus on technically meaningful material information such as:

- UNSPSC
- product/material type
- dimensions
- material
- grade
- pressure rating
- standards
- specifications
- capacity
- application
- other engineering attributes

Do not decide whether the records are a match.

Do not recommend MATCH or NOT A MATCH.

Return ONLY valid JSON in exactly this structure:

{{
    "similarities": [
        "..."
    ],
    "differences": [
        "..."
    ]
}}

LEFT RECORD:
{json.dumps(
    left_record,
    indent=4,
    ensure_ascii=False
)}

RIGHT RECORD:
{json.dumps(
    right_record,
    indent=4,
    ensure_ascii=False
)}
"""

    # --------------------------------------------------------
    # Call Qwen through Groq
    # --------------------------------------------------------

    time.sleep(1)
    try:

        response = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0,
        )

        print(
            ">>> QWEN RESPONSE RECEIVED <<<",
            flush=True
        )

    except Exception as error:

        print(
            "\n========== GROQ ERROR =========="
        )

        print(
            "Error type:",
            type(error).__name__
        )

        print(
            "Error message:",
            str(error)
        )

        print(
            "================================\n"
        )

        raise

    # --------------------------------------------------------
    # Extract Qwen response
    # --------------------------------------------------------

    raw_content = (
        response
        .choices[0]
        .message
        .content
        .strip()
    )

    print(
        ">>> QWEN RAW RESPONSE RECEIVED <<<",
        flush=True
    )

    # --------------------------------------------------------
    # Remove markdown code fences if Qwen adds them
    # --------------------------------------------------------

    if raw_content.startswith("```json"):

        raw_content = raw_content[7:]

        if raw_content.endswith("```"):
            raw_content = raw_content[:-3]

        raw_content = raw_content.strip()

    elif raw_content.startswith("```"):

        raw_content = raw_content[3:]

        if raw_content.endswith("```"):
            raw_content = raw_content[:-3]

        raw_content = raw_content.strip()

    # --------------------------------------------------------
    # Parse JSON
    # --------------------------------------------------------

    try:

        analysis = json.loads(
            raw_content
        )

    except json.JSONDecodeError:

        print(
            "\nWARNING: Qwen returned invalid JSON."
        )

        print(
            "Raw response:"
        )

        print(
            raw_content
        )

        analysis = {
            "similarities": [],
            "differences": [
                "LLM returned invalid JSON."
            ]
        }

    # --------------------------------------------------------
    # Prepare human evaluation output
    # --------------------------------------------------------

    evaluation_output = {

        "splink_score": result.get(
            "splink_score"
        ),

        "splink_match_weight": result.get(
            "splink_match_weight"
        ),

        "left_product_id": result.get(
            "left_product_id"
        ),

        "left_cpse": result.get(
            "left_cpse"
        ),

        "left_unspsc": result.get(
            "left_unspsc"
        ),

        "left_material_desc": result.get(
            "left_material_desc"
        ),

        "left_technical_desc": result.get(
            "left_technical_desc"
        ),

        "left_attributes": result.get(
            "left_attributes"
        ),

        "right_product_id": result.get(
            "right_product_id"
        ),

        "right_cpse": result.get(
            "right_cpse"
        ),

        "right_unspsc": result.get(
            "right_unspsc"
        ),

        "right_material_desc": result.get(
            "right_material_desc"
        ),

        "right_technical_desc": result.get(
            "right_technical_desc"
        ),

        "right_attributes": result.get(
            "right_attributes"
        ),

        "similarities": analysis.get(
            "similarities",
            []
        ),

        "differences": analysis.get(
            "differences",
            []
        ),
    }

    # --------------------------------------------------------
    # Display human evaluation
    # --------------------------------------------------------

    print(
        "\n========== HUMAN EVALUATION ==========\n"
    )

    print(
        json.dumps(
            evaluation_output,
            indent=4,
            ensure_ascii=False
        )
    )

    # --------------------------------------------------------
    # Human decision
    # --------------------------------------------------------

    print(
        "\n>>> WAITING FOR HUMAN INPUT <<<",
        flush=True
    )

    while True:

        human_decision = input(
            "\nEnter decision "
            "(MATCH / NOT A MATCH): "
        ).strip().upper()

        if human_decision in {
            "MATCH",
            "NOT A MATCH"
        }:
            break

        print(
            "Please enter MATCH or NOT A MATCH."
        )

    # --------------------------------------------------------
    # Store human evaluation
    # --------------------------------------------------------

    result["human_evaluation"] = {

        "similarities": analysis.get(
            "similarities",
            []
        ),

        "differences": analysis.get(
            "differences",
            []
        ),
    }

    result["human_decision"] = (
        human_decision
    )

    # --------------------------------------------------------
    # Route based on human decision
    # --------------------------------------------------------

    if human_decision == "MATCH":

        result["prototype_decision"] = (
            "NO NEW NMC CODE GENERATION"
        )

    else:

        result["prototype_decision"] = (
            "GENERATE NEW NMC"
        )

    # --------------------------------------------------------
    # Add decision to JSON output
    # --------------------------------------------------------

    evaluation_output["human_decision"] = (
        human_decision
    )

    evaluation_output["prototype_decision"] = (
        result["prototype_decision"]
    )

    # --------------------------------------------------------
    # Save human evaluation
    # --------------------------------------------------------

    output_file = (
        "human_evaluation_results.json"
    )

    with open(
        output_file,
        "a",
        encoding="utf-8"
    ) as file:

        file.write(
            json.dumps(
                evaluation_output,
                ensure_ascii=False
            )
        )

        file.write("\n")

    print(
        "\n>>> HUMAN EVALUATION SAVED <<<",
        flush=True
    )

    return result