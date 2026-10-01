import os
import json
import pandas as pd


REQUIRED_COLUMNS = [
    "material_id",
    "cpse_id",
    "cpse_code",
    "cpse_name",
    "sector",
    "sap_plant_code",
    "legacy_sap_material_number",
    "material_code",
    "material_description",
    "specification",
    "uom",
    "category",
    "subcategory",
    "material_group",
    "procurement_price_inr",
    "unspsc_code"
]


COLUMN_ALIASES = {
    "material_id": "material_id",
    "cpse_id": "cpse_id",
    "cpse": "cpse_id",
    "cpse_code": "cpse_code",
    "cpse_name": "cpse_name",
    "sector": "sector",
    "sap_plant_code": "sap_plant_code",
    "plant_code": "sap_plant_code",
    "legacy_sap_material_number": "legacy_sap_material_number",
    "material_number": "legacy_sap_material_number",
    "material_code": "material_code",
    "material_description": "material_description",
    "material_desc": "material_description",
    "mat_desc": "material_description",
    "specification": "specification",
    "technical_specification": "specification",
    "technical_spec": "specification",
    "uom": "uom",
    "unit_of_measure": "uom",
    "category": "category",
    "subcategory": "subcategory",
    "material_group": "material_group",
    "mat_group": "material_group",
    "procurement_price_inr": "procurement_price_inr",
    "price_inr": "procurement_price_inr",
    "unspsc_code": "unspsc_code"
}


def load_sample_json():

    path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        "data",
        "sample",
        "sample_materials.json"
    )

    with open(path, "r", encoding="utf-8") as file:
        return json.load(file)


def ingest_records(records):

    if not isinstance(records, list):
        raise ValueError(
            "Expected records to be a list"
        )

    if not records:
        raise ValueError(
            "No material records found"
        )

    df = pd.DataFrame(records)

    df.columns = [
        str(column).strip().lower().replace(" ", "_")
        for column in df.columns
    ]

    df.rename(
        columns={
            column: COLUMN_ALIASES.get(column, column)
            for column in df.columns
        },
        inplace=True
    )

    missing_columns = [
        column
        for column in REQUIRED_COLUMNS
        if column not in df.columns
    ]

    if missing_columns:
        raise ValueError(
            f"Missing required columns: {missing_columns}"
        )

    df = df[REQUIRED_COLUMNS].copy()

    return df


def ingest(source="sample"):

    if source == "sample":
        records = load_sample_json()

    else:
        raise ValueError(
            "source must be 'sample'"
        )

    return ingest_records(records)