from fastapi import APIRouter, HTTPException
from database.connection import supabase
from services.aiml_service import standardize_materials
import requests


router = APIRouter(
    prefix="/api",
    tags=["AI/ML"]
)


# ------------------------------------------------
# TEST AI/ML CONNECTION
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

    materials = materials_response.data

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
            "message": "AI/ML API connection successful!",
            "aiml_response": result
        }

    except requests.exceptions.RequestException as error:

        raise HTTPException(
            status_code=502,
            detail=f"AI/ML API request failed: {str(error)}"
        )

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

    return response.data


# ------------------------------------------------
# RUN AI/ML
# ------------------------------------------------

@router.post("/run-aiml")
def run_aiml():

    # 1. Get combined material + CPSE data

    response = (
        supabase
        .table("material_master_with_cpse")
        .select("*")
        .execute()
    )

    materials = response.data

    if not materials:
        raise HTTPException(
            status_code=404,
            detail="No material records found."
        )

    # 2. Send materials to AI/ML API

    try:

        aiml_response = requests.post(
            "http://127.0.0.1:8001/standardize",
            json={
                "materials": materials
            },
            timeout=120
        )

        aiml_response.raise_for_status()

    except requests.RequestException as error:

        raise HTTPException(
            status_code=500,
            detail=f"AI/ML API request failed: {error}"
        )

    # 3. Return AI/ML result

    return {
        "message": "AI/ML processing successful!",
        "aiml_response": aiml_response.json()
    }