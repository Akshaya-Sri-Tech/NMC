import re


ATTRIBUTE_ALIASES = {
    "grade": "material_grade",
    "connection_type": "connection",
    "voltage_rating": "voltage",
    "cores": "core_count",
    "armoured": "armour",
    "material_type": "material",
    "type": "product_type",
    "bearing_model": "model",
    "pressure_range": "range",

    "material_property": "material",
    "flange_type": "face_type",
    "conductor_cross_section": "cross_section_area",
    "insulation_material": "insulation",
    "classification": "electrode_type",
}


def clean_value(value):
    if value is None:
        return None

    if isinstance(value, bool):
        return str(value).lower()

    if isinstance(value, list):
        value = [
            str(v).strip()
            for v in value
            if v is not None and str(v).strip()
        ]

        if not value:
            return None

        return value

    value = str(value).strip()

    if not value:
        return None

    return value


def canonicalize_keys(attrs):
    result = {}

    for key, value in attrs.items():

        key = str(key).strip().lower()

        new_key = ATTRIBUTE_ALIASES.get(key, key)

        value = clean_value(value)

        if value is None:
            continue

        # If both old and canonical key exist,
        # prefer the canonical key.
        if new_key in result:
            continue

        result[new_key] = value

    return result


def single_value(value):
    if isinstance(value, list):
        if not value:
            return ""

        return str(value[0]).strip()

    return str(value).strip()


def normalize_product_type(attrs):

    value = attrs.get("product_type")

    if not value:
        return attrs

    if isinstance(value, list):

        values = [
            str(v).lower().strip()
            for v in value
        ]

        # Prefer the most specific type
        if "hex bolt" in values:
            attrs["product_type"] = "hex bolt"

        elif "hexagonal" in values:
            attrs["product_type"] = "hex bolt"

        elif "bolt" in values:
            attrs["product_type"] = "bolt"

        elif "centrifugal pump" in values:
            attrs["product_type"] = "centrifugal pump"

        else:
            attrs["product_type"] = values[0]

    return attrs


def normalize_material(attrs):

    # high tensile -> high tensile steel
    if "material" in attrs:

        value = single_value(attrs["material"]).lower()

        if value in {
            "high tensile",
            "high tensile steel"
        }:
            attrs["material"] = "high tensile steel"

    # industrial -> industrial grade
    if "material_grade" in attrs:

        value = single_value(attrs["material_grade"]).lower()

        if value == "industrial":
            attrs["material_grade"] = "industrial grade"

    return attrs


def normalize_stainless_steel(attrs):

    # SS304 -> stainless steel 304
    for key in ["material", "body_material", "casing_material"]:

        if key not in attrs:
            continue

        value = single_value(attrs[key]).strip()

        match = re.fullmatch(
            r"(?:ss|stainless\s*steel)\s*(\d{3})",
            value,
            re.IGNORECASE
        )

        if match:

            grade = match.group(1)

            attrs[key] = f"stainless steel {grade}"

            if key == "material":
                attrs["material_grade"] = grade

    return attrs


def normalize_face_type(attrs):

    if "face_type" not in attrs:
        return attrs

    value = single_value(attrs["face_type"]).lower()

    if value in {
        "rf",
        "raised face",
        "raisedface"
    }:
        attrs["face_type"] = "raised face"

    return attrs


def normalize_pipe(attrs):

    # Remove duplicate semantic field
    if (
        "manufacturing_process" in attrs
        and "construction" in attrs
    ):
        del attrs["manufacturing_process"]

    # Prefer size over redundant nominal_size
    if "size" in attrs and "nominal_size" in attrs:
        del attrs["nominal_size"]

    return attrs


def normalize_bolt(attrs):

    # M20 x 80 incorrectly extracted as size
    if "size" in attrs:

        value = single_value(attrs["size"])

        match = re.fullmatch(
            r"(M\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)",
            value,
            re.IGNORECASE
        )

        if match:

            attrs["thread_size"] = match.group(1).upper()
            attrs["length"] = f"{match.group(2)} mm"

            del attrs["size"]

    # diameter=M20 is actually thread size
    if "diameter" in attrs:

        value = single_value(attrs["diameter"])

        if re.fullmatch(
            r"M\d+(?:\.\d+)?",
            value,
            re.IGNORECASE
        ):

            attrs["thread_size"] = value.upper()

            del attrs["diameter"]

    return attrs


def normalize_valve(attrs, source_text):

    text = str(source_text).lower()

    # Technical specification should win if conflicting
    # Example:
    # description -> class 300
    # specification -> class 600
    class_matches = re.findall(
        r"class\s*(\d+)",
        text,
        re.IGNORECASE
    )

    if class_matches:

        technical_class = class_matches[-1]

        attrs["pressure_class"] = technical_class

        if "flange_rating" in attrs:
            del attrs["flange_rating"]

        if "flange_rating_2" in attrs:
            del attrs["flange_rating_2"]

    # Remove duplicate representation
    if "flange_rating" in attrs:
        value = single_value(attrs["flange_rating"])

        match = re.search(r"\d+", value)

        if match:
            attrs["pressure_class"] = match.group(0)

        del attrs["flange_rating"]

    return attrs


def normalize_cable(attrs):

    if "insulation_material" in attrs:

        if "insulation" not in attrs:
            attrs["insulation"] = attrs["insulation_material"]

        del attrs["insulation_material"]

    return attrs


def normalize_conductor(attrs):

    if "conductor_cross_section" in attrs:

        if "cross_section_area" not in attrs:
            attrs["cross_section_area"] = (
                attrs["conductor_cross_section"]
            )

        del attrs["conductor_cross_section"]

    return attrs


def normalize_bearing(attrs):

    if "bearing_type" not in attrs:
        return attrs

    value = single_value(attrs["bearing_type"]).lower()

    if value in {
        "deep groove",
        "deep-groove",
        "deep groove ball",
        "deep groove ball bearing"
    }:
        attrs["bearing_type"] = "deep groove ball bearing"

    return attrs


def normalize_pump(attrs):

    # capacity == flow_rate
    if "flow_rate" in attrs and "capacity" in attrs:
        del attrs["capacity"]

    elif "capacity" in attrs:
        attrs["flow_rate"] = attrs["capacity"]
        del attrs["capacity"]

    # total_head == head
    if "head" in attrs and "total_head" in attrs:
        del attrs["total_head"]

    elif "total_head" in attrs:
        attrs["head"] = attrs["total_head"]
        del attrs["total_head"]

    # Prefer specific pump type
    if "pump_type" in attrs:

        value = single_value(attrs["pump_type"]).lower()

        if "centrifugal" in value:

            if "horizontal" in value:
                attrs["product_type"] = "horizontal centrifugal pump"
            else:
                attrs["product_type"] = "centrifugal pump"

    return attrs


def normalize_transmitter(attrs):

    # pressure=10 bar is usually upper limit of range,
    # not a separate pressure attribute.
    if "range" in attrs:

        if "pressure" in attrs:
            del attrs["pressure"]

    # current=20 mA is usually upper limit of output signal
    if "output_signal" in attrs:

        if "current" in attrs:
            del attrs["current"]

    # Duplicate transmitter range
    if "hart_range" in attrs:

        if "range" in attrs:
            del attrs["hart_range"]

    # connection_size duplicates process_connection
    if (
        "connection_size" in attrs
        and "process_connection" in attrs
    ):
        del attrs["connection_size"]

    elif "connection_size" in attrs:

        attrs["process_connection"] = (
            attrs["connection_size"]
        )

        del attrs["connection_size"]

    return attrs


def normalize_steel(attrs, source_text):

    text = str(source_text)

    # IS 2062 E250
    match = re.search(
        r"IS\s*[-/]?\s*2062\s+"
        r"(E\d+)",
        text,
        re.IGNORECASE
    )

    if match:

        attrs["standard"] = "IS 2062"
        attrs["material_grade"] = (
            match.group(1).upper()
        )

    return attrs


def normalize_electrode(attrs):

    if "electrode_type" in attrs:

        value = single_value(
            attrs["electrode_type"]
        ).upper()

        attrs["electrode_type"] = value

    return attrs


def normalize_chemical(attrs):

    if "formula" in attrs:

        value = single_value(attrs["formula"])

        if value.lower() == "naoh":
            attrs["formula"] = "NaOH"

    return attrs


def remove_duplicates(attrs):

    # Duplicate semantic fields
    duplicate_pairs = [
        ("manufacturing_process", "construction"),
        ("nominal_size", "size"),
        ("flange_type", "face_type"),
        ("capacity", "flow_rate"),
        ("total_head", "head"),
        ("hart_range", "range"),
        ("connection_size", "process_connection"),
    ]

    for first, second in duplicate_pairs:

        if first in attrs and second in attrs:
            del attrs[first]

    return attrs


def final_cleanup(attrs):

    cleaned = {}

    for key, value in attrs.items():

        value = clean_value(value)

        if value is None:
            continue

        if isinstance(value, list):

            value = [
                str(v).strip()
                for v in value
                if str(v).strip()
            ]

            if not value:
                continue

        cleaned[key] = value

    return cleaned


def dqc_attributes(attrs, source_text):

    if not isinstance(attrs, dict):
        return {}

    # 1. Canonical attribute names
    attrs = canonicalize_keys(attrs)

    # 2. Product type consistency
    attrs = normalize_product_type(attrs)

    # 3. Material consistency
    attrs = normalize_material(attrs)

    attrs = normalize_stainless_steel(attrs)

    # 4. Component-specific corrections
    attrs = normalize_bolt(attrs)
    attrs = normalize_pipe(attrs)
    attrs = normalize_valve(attrs, source_text)
    attrs = normalize_cable(attrs)
    attrs = normalize_conductor(attrs)
    attrs = normalize_bearing(attrs)
    attrs = normalize_pump(attrs)
    attrs = normalize_transmitter(attrs)
    attrs = normalize_steel(attrs, source_text)
    attrs = normalize_electrode(attrs)
    attrs = normalize_chemical(attrs)

    # 5. Common terminology
    attrs = normalize_face_type(attrs)

    # 6. Remove duplicate semantic attributes
    attrs = remove_duplicates(attrs)

    # 7. Final cleanup
    attrs = final_cleanup(attrs)

    return attrs