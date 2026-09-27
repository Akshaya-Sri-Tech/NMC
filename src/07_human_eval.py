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
You are an industrial material comparison assistant.

Your task is to compare TWO industrial material records and provide a
short, clear, technically meaningful explanation for a human evaluator.

You are NOT making the final MATCH / NOT A MATCH decision.

==================================================
CORE REQUIREMENTS
==================================================

You MUST:

1. Identify meaningful technical similarities.
2. Identify meaningful technical differences.
3. Use the actual product IDs when referring to the records.
4. Keep every explanation short and easy to understand.
5. Make every statement directly supported by the supplied records.
6. Return valid JSON that can ALWAYS be parsed programmatically.

The output will be shown directly to a user.

Therefore:

- NEVER return invalid JSON.
- NEVER return an empty "similarities" array.
- NEVER return an empty "differences" array.
- NEVER return an error message such as:
  "LLM returned invalid JSON."
- NEVER return explanations outside the JSON object.

==================================================
HOW TO REFER TO RECORDS
==================================================

DO NOT use phrases such as:

"left record"
"right record"
"left side"
"right side"
"first record"
"second record"

Instead, refer to each material using its actual product ID.

For example, if the IDs are a012 and a019:

GOOD:
"a012 and a019 both specify a 2-inch ball valve."

GOOD:
"a012 specifies SS304, while a019 does not specify body material."

GOOD:
"Connection differs: a012 uses rf; a019 specifies flanged."

BAD:
"Left record specifies SS304; right record does not."

==================================================
KEEP OUTPUT SHORT
==================================================

Each similarity or difference MUST be a concise hint.

Do NOT write long paragraphs.

Prefer this style:

"Both specify a 2-inch size."

"Both use UNSPSC 40141600."

"a012 specifies SS304; a019 does not."

"Connection differs: a012 specifies rf; a019 specifies flanged."

Avoid unnecessary words.

Each item should normally be ONE short sentence.

==================================================
TECHNICAL INFORMATION TO COMPARE
==================================================

Focus ONLY on meaningful technical attributes explicitly present in
the supplied records.

Consider:

- UNSPSC
- product type
- material
- body material
- material grade
- size
- dimensions
- pressure class
- pressure rating
- schedule
- standard
- specification
- model
- connection
- face type
- manufacturing process
- formulation
- viscosity grade
- additives
- coating
- sealing
- capacity
- other explicit engineering attributes

Use structured attributes as the primary source.

Use material descriptions and technical descriptions to supplement
the structured attributes.

==================================================
DO NOT COMPARE METADATA
==================================================

NEVER compare or mention:

- product_id as a difference
- CPSE name
- company name
- organization name
- SAP identifiers
- internal database identifiers
- cluster_id
- Splink score
- Splink match weight
- human_decision
- prototype_decision

Product IDs are used ONLY to identify which material is being discussed.

For example:

GOOD:
"a012 and a019 both specify pressure class 300."

BAD:
"a012 and a019 have different product IDs."

==================================================
NO HALLUCINATION
==================================================

Every statement MUST be supported by information explicitly present
in the two supplied records.

DO NOT:

- invent attributes
- assume missing values
- use outside knowledge
- infer engineering equivalence
- infer intended application
- infer suitability
- infer performance
- infer safety
- infer specifications
- expand abbreviations unless their meaning is explicitly provided
- assume two terms are equivalent unless the supplied data establishes it

For example:

If one record contains:

"connection": "rf"

and the other contains:

"connection": "flanged"

DO NOT claim that rf means flanged.

Simply report:

"Connection differs: a012 specifies rf; a019 specifies flanged."

==================================================
MISSING INFORMATION
==================================================

Missing information is NOT automatically a technical difference.

If:

a012:
"body_material": "ss 304"

and a019:
no body_material

write:

"a012 specifies SS304; a019 does not specify body material."

Do NOT write:

"Material differs: SS304 vs unspecified."

Similarly:

"a012 specifies pressure class 300; a019 does not specify pressure class."

==================================================
SIMILARITIES ARE MANDATORY
==================================================

The "similarities" array MUST contain at least ONE meaningful item.

Ideally provide 1–2 strong similarities.

NEVER return:

"similarities": []

Do NOT invent a similarity merely to satisfy this requirement.

If there are few similarities, look across all explicitly provided
technical information, including:

- UNSPSC
- product type
- size
- material
- grade
- pressure class
- standard
- specification
- connection
- other explicit attributes

Only report a similarity when both records explicitly support it.

For example:

"Both specify UNSPSC 40141600."

"Both specify a 2-inch size."

==================================================
DIFFERENCES ARE MANDATORY
==================================================

The "differences" array MUST contain at least ONE meaningful item.

Ideally provide 1–2 strong differences.

NEVER return:

"differences": []

Only report differences that are directly supported by the input.

Examples:

"Material differs: a012 specifies SS304; a019 specifies SS316."

"Size differs: a012 specifies 2in; a019 specifies 4in."

"Connection differs: a012 specifies rf; a019 specifies flanged."

If one side has information and the other does not:

"a012 specifies SS304; a019 does not specify body material."

==================================================
DO NOT CONFUSE MISSING ATTRIBUTES
==================================================

An attribute appearing in one structured record but not the other does
NOT automatically mean the products have different technical values.

Example:

a012:
"product_type": "ball valve"

a019:
no product_type attribute

Do NOT write:

"Product type differs."

Instead write:

"a012 specifies product type as ball valve; a019 does not specify product type."

==================================================
PRIORITY OF INFORMATION
==================================================

Prioritize meaningful engineering information.

Priority order:

1. Material / grade
2. Product type
3. Size / dimensions
4. Pressure class / rating
5. Standard / specification
6. Connection / face type
7. Other engineering attributes
8. UNSPSC

Do NOT waste output on:

- wording differences
- capitalization
- punctuation
- word order
- spelling style
- repeated information
- company names
- product IDs as differences

==================================================
AVOID DUPLICATION
==================================================

Do not state the same fact multiple times.

BAD:

[
    "Both are 2-inch valves.",
    "Both specify 2 inches.",
    "Both have a size of 2in."
]

GOOD:

[
    "Both specify a 2-inch size."
]

Similarly, combine closely related facts when appropriate.

For example:

GOOD:

"Both specify a 2-inch ball valve with pressure class 300."

==================================================
IMPORTANT: NEVER PRODUCE EMPTY SIMILARITIES
==================================================

Before producing the final answer, inspect ALL explicit technical
attributes again.

If your first comparison finds no similarity, re-check:

- UNSPSC
- product type
- size
- material
- grade
- pressure class
- standard
- specification
- connection
- other explicit attributes

Find at least ONE similarity that is genuinely supported by both
records.

DO NOT fabricate information.

==================================================
IMPORTANT: JSON MUST ALWAYS BE VALID
==================================================

Your response will be passed directly to Python's json.loads().

Therefore the response MUST be valid JSON.

Return EXACTLY this structure:

{{
    "similarities": [
        "short explanation"
    ],
    "differences": [
        "short explanation"
    ]
}}

Rules:

- Use double quotes.
- Escape internal double quotes correctly.
- No trailing commas.
- No markdown.
- No code fences.
- No comments.
- No text before the JSON.
- No text after the JSON.
- Both arrays are required.
- Both arrays must contain at least one string.
- Every array item must be a string.

NEVER output:

"LLM returned invalid JSON."

NEVER output an empty array.

NEVER output Python dictionary syntax.

==================================================
FINAL SELF-CHECK BEFORE RESPONDING
==================================================

Before returning the answer, silently verify:

[ ] Is the response valid JSON?
[ ] Does "similarities" contain at least one item?
[ ] Does "differences" contain at least one item?
[ ] Are all statements supported by the input?
[ ] Did I avoid hallucination?
[ ] Did I avoid product IDs as technical differences?
[ ] Did I avoid CPSE/company names?
[ ] Did I refer to records using their actual product IDs?
[ ] Are the explanations short?
[ ] Did I avoid calling missing information a contradiction?
[ ] Did I avoid MATCH / NOT A MATCH?
[ ] Is there absolutely no text outside the JSON object?

If any check fails, correct the output before returning it.

==================================================
RECORD A
==================================================

{json.dumps(
    left_record,
    indent=4,
    ensure_ascii=False
)}

==================================================
RECORD B
==================================================

{json.dumps(
    right_record,
    indent=4,
    ensure_ascii=False
)}
"""

    # --------------------------------------------------------
    # Call Qwen through Groq
    # --------------------------------------------------------

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
            response_format={
                "type": "json_object"
            },
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

    except json.JSONDecodeError as error:

        analysis = {
        "similarities": [
            "Difficult to find - Refer description"
        ],
        "differences": [
            "Difficult to find - Refer description"
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

    registries_dir = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "registries"
    )
    os.makedirs(registries_dir, exist_ok=True)

    output_file = os.path.join(
        registries_dir,
        "human_evaluation_results.json"
    )

    file_path = "registries/human_evaluation_results.json"

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            results = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
            results = []

    results.append(result)
 
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=4, ensure_ascii=False)

    return result