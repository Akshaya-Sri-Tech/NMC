from fastapi import APIRouter, UploadFile, File, HTTPException
from database.connection import supabase
import csv
import io


router = APIRouter(
    prefix="/api",
    tags=["Ingestion"]
)


@router.post("/ingest")
async def ingest_csv(file: UploadFile = File(...)):

    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Only CSV files are allowed."
        )

    contents = await file.read()

    try:
        text = contents.decode("utf-8-sig")
        reader = csv.DictReader(io.StringIO(text))
        rows = list(reader)

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Could not read the CSV file."
        )

    if not rows:
        raise HTTPException(
            status_code=400,
            detail="CSV file is empty."
        )

    inserted_materials = 0
    created_cpse = 0
    existing_cpse = 0

    for row in rows:

        cpse_code = row["CPSE_ID"].strip()

        # ------------------------------------------------
        # 1. Check whether CPSE already exists
        # ------------------------------------------------

        cpse_response = (
            supabase
            .table("cpse")
            .select("cpse_id")
            .eq("cpse_code", cpse_code)
            .limit(1)
            .execute()
        )

        if cpse_response.data:

            cpse_id = cpse_response.data[0]["cpse_id"]
            existing_cpse += 1

        else:

            # ------------------------------------------------
            # 2. Create CPSE if it doesn't exist
            # ------------------------------------------------

            new_cpse = {
                "cpse_code": cpse_code,
                "cpse_name": row.get("CPSE_Name", cpse_code),
                "sector": row.get("Sector"),
                "description": row.get("CPSE_Description")
            }

            cpse_insert = (
                supabase
                .table("cpse")
                .insert(new_cpse)
                .execute()
            )

            if not cpse_insert.data:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to create CPSE: {cpse_code}"
                )

            cpse_id = cpse_insert.data[0]["cpse_id"]
            created_cpse += 1

        # ------------------------------------------------
        # 3. Insert material
        # ------------------------------------------------

        material = {
            "cpse_id": cpse_id,
            "material_code": row.get("Material_Code"),
            "material_description": row["Material_Description"],
            "specification": row["Technical_Specification"],
            "uom": row.get("UOM"),
            "category": row.get("Category"),
            "subcategory": row.get("Subcategory"),
            "material_group": row.get("Material_Group"),
            "procurement_price_inr": row.get("Procurement_Price_INR"),
            "unspsc_code": row.get("UNSPSC_Code"),
            "sap_plant_code": row["SAP_Plant_Code"],
            "legacy_sap_material_number": row[
                "Legacy_SAP_Material_Number"
            ]
        }

        supabase \
            .table("material_master") \
            .insert(material) \
            .execute()

        inserted_materials += 1

    return {
        "message": "CSV ingestion successful!",
        "total_rows_processed": len(rows),
        "cpse_created": created_cpse,
        "cpse_already_existing": existing_cpse,
        "materials_inserted": inserted_materials
    }