from fastapi import APIRouter, HTTPException

from backend.database.connection import supabase
from backend.services.aiml_service import standardize_materials


router = APIRouter(
    prefix="/api",
    tags=["AI/ML"]
)


# ------------------------------------------------
# TEST AI/ML
# ------------------------------------------------

@router.post("/test-aiml")
def test_aiml():

    materials_response = (
        supabase
        .table("material_master_with_cpse")
        .select("*")
        .limit(2)
        .execute()
    )

    materials = materials_response.data or []

    if not materials:
        raise HTTPException(
            status_code=404,
            detail="No materials found in database"
        )

    try:

        result = standardize_materials(
            materials
        )

        return {
            "message": "AI/ML processing successful!",
            "aiml_response": result,
            "records_processed": len(materials)
        }

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# ------------------------------------------------
# GET MATERIALS FOR AI/ML
# ------------------------------------------------

@router.get("/materials-for-aiml")
def get_materials_for_aiml():

    response = (
        supabase
        .table("material_master_with_cpse")
        .select("*")
        .execute()
    )

    return response.data or []


# ------------------------------------------------
# RUN AI/ML
# ------------------------------------------------

@router.post("/run-aiml")
def run_aiml():

    # 1. Get material + CPSE data

    response = (
        supabase
        .table("material_master_with_cpse")
        .select("*")
        .execute()
    )

    materials = response.data or []

    if not materials:
        raise HTTPException(
            status_code=404,
            detail="No material records found."
        )

    # 2. Run AI/ML pipeline locally

    try:

        result = standardize_materials(
            materials
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )

    # 3. Return AI/ML result

    return {
        "message": "AI/ML processing successful!",
        "aiml_response": result,
        "records_sent_to_aiml": len(materials)
    }