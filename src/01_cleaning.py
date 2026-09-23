import re
import unicodedata

import pandas as pd


TEXT_COLUMNS = [
    "material_description",
    "specification",
    "cpse_name",
    "sector",
    "category",
    "subcategory"
]


CODE_COLUMNS = [
    "material_id",
    "cpse_id",
    "cpse_code",
    "sap_plant_code",
    "legacy_sap_material_number",
    "material_code",
    "uom",
    "material_group",
    "unspsc_code"
]


def clean_text(text):

    if pd.isna(text):
        return ""

    text = str(text)

    # Unicode normalization
    text = unicodedata.normalize("NFKC", text)

    # Whitespace normalization
    text = text.replace("\u00A0", " ")
    text = text.replace("\t", " ")
    text = text.replace("\n", " ")
    text = text.replace("\r", " ")

    # Engineering symbol normalization
    replacements = {
        "×": " x ",
        "✕": " x ",
        "–": "-",
        "—": "-",
        "−": "-",
        "″": '"',
        "′": "'",
        "ø": " dia ",
        "Ø": " dia ",
        "°": " deg ",
        "µ": "u",
        "μ": "u"
    }

    for old, new in replacements.items():
        text = text.replace(old, new)

    # Case normalization
    text = text.lower()

    # Inches
    text = re.sub(
        r'(\d+(?:\.\d+)?)\s*"',
        r"\1 inch",
        text
    )

    # Multiplication sign spacing
    text = re.sub(
        r"(?<=\d)\s*x\s*(?=\d)",
        " x ",
        text
    )

    # Punctuation spacing
    text = re.sub(r"\s*-\s*", "-", text)
    text = re.sub(r"\s*/\s*", "/", text)
    text = re.sub(r"\s*:\s*", ": ", text)
    text = re.sub(r"\s*,\s*", ", ", text)
    text = re.sub(r"\s*;\s*", "; ", text)

    # Remove repeated punctuation
    text = re.sub(r"-{2,}", "-", text)
    text = re.sub(r"/{2,}", "/", text)

    # Collapse whitespace
    text = re.sub(r"\s+", " ", text)

    # Remove whitespace before punctuation
    text = re.sub(r"\s+([,:;])", r"\1", text)

    # Remove leading/trailing punctuation
    text = re.sub(r"^[\s,;/:-]+", "", text)
    text = re.sub(r"[\s,;/:-]+$", "", text)

    return text.strip()


def clean_dataframe(df):

    cleaned_df = df.copy()

    for column in TEXT_COLUMNS:

        if column in cleaned_df.columns:
            cleaned_df[column] = (
                cleaned_df[column]
                .apply(clean_text)
            )

    for column in CODE_COLUMNS:

        if column in cleaned_df.columns:
            cleaned_df[column] = (
                cleaned_df[column]
                .astype("string")
                .str.strip()
                .str.upper()
            )

    cleaned_df["procurement_price_inr"] = pd.to_numeric(
        cleaned_df["procurement_price_inr"],
        errors="coerce"
    )

    return cleaned_df