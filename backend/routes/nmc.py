from fastapi import APIRouter, HTTPException
from backend.database.connection import supabase
from pydantic import BaseModel
from typing import Any, Dict, List


router = APIRouter(
    prefix="/api/nmc",
    tags=["NMC"]
)


# ============================================================
# REQUEST MODEL
# ============================================================

class NMCResult(BaseModel):
    source_pair: Dict[str, Any]
    results: List[Dict[str, Any]]


# ============================================================
# POST NMC RESULTS
# ============================================================

@router.post("/results")
def save_nmc_results(payload: NMCResult):

    saved_results = []

    for result in payload.results:

        material_id = result.get("material_id")

        standard_material = result.get(
            "standard_material",
            {}
        )

        mapping = result.get(
            "mapping",
            {}
        )

        if not material_id:
            raise HTTPException(
                status_code=400,
                detail="material_id is required."
            )

        common_material_code = standard_material.get(
            "common_material_code"
        )

        standardized_description = standard_material.get(
            "standardized_description"
        )

        if not common_material_code:
            raise HTTPException(
                status_code=400,
                detail="common_material_code is required."
            )

        if not standardized_description:
            raise HTTPException(
                status_code=400,
                detail="standardized_description is required."
            )

        # ====================================================
        # 1. CHECK MATERIAL EXISTS
        # ====================================================

        material_response = (
            supabase
            .table("material_master")
            .select("material_id")
            .eq("material_id", material_id)
            .limit(1)
            .execute()
        )

        if not material_response.data:
            raise HTTPException(
                status_code=404,
                detail=f"Material {material_id} not found."
            )

        # ====================================================
        # 2. CHECK IF STANDARD MATERIAL ALREADY EXISTS
        # ====================================================

        existing_standard = (
            supabase
            .table("standard_material")
            .select("*")
            .eq(
                "common_material_code",
                common_material_code
            )
            .limit(1)
            .execute()
        )

        # ====================================================
        # 3. CREATE OR REUSE STANDARD MATERIAL
        # ====================================================

        if existing_standard.data:

            standard_material_row = (
                existing_standard.data[0]
            )

        else:

            standard_insert = {

                "common_material_code":
                    common_material_code,

                "standardized_description":
                    standardized_description,

                "standardized_specification":
                    standard_material.get(
                        "standardized_specification"
                    ),

                "uom":
                    standard_material.get("uom"),

                "category":
                    standard_material.get("category"),

                "subcategory":
                    standard_material.get("subcategory"),

                "material_group":
                    standard_material.get("material_group"),

                "status": "ACTIVE"
            }

            standard_response = (
                supabase
                .table("standard_material")
                .insert(standard_insert)
                .execute()
            )

            if not standard_response.data:
                raise HTTPException(
                    status_code=500,
                    detail="Failed to create standard material."
                )

            standard_material_row = (
                standard_response.data[0]
            )

        standard_material_id = (
            standard_material_row[
                "standard_material_id"
            ]
        )

        # ====================================================
        # 4. CHECK EXISTING MAPPING
        # ====================================================

        existing_mapping = (
            supabase
            .table("material_mapping")
            .select("*")
            .eq(
                "material_id",
                material_id
            )
            .eq(
                "standard_material_id",
                standard_material_id
            )
            .limit(1)
            .execute()
        )

        # ====================================================
        # 5. CREATE MAPPING
        # ====================================================

        if existing_mapping.data:

            mapping_row = (
                existing_mapping.data[0]
            )

        else:

            mapping_insert = {

                "material_id":
                    material_id,

                "standard_material_id":
                    standard_material_id,

                "mapping_type":
                    mapping.get(
                        "mapping_type",
                        "NEW_NMC"
                    ),

                "confidence":
                    mapping.get(
                        "confidence"
                    ),

                "status": "PENDING"
            }

            mapping_response = (
                supabase
                .table("material_mapping")
                .insert(mapping_insert)
                .execute()
            )

            if not mapping_response.data:
                raise HTTPException(
                    status_code=500,
                    detail="Failed to create material mapping."
                )

            mapping_row = (
                mapping_response.data[0]
            )

        saved_results.append({

            "material": material_id,

            "standard_material":
                standard_material_row,

            "mapping":
                mapping_row
        })

    # ========================================================
    # FINAL RESPONSE
    # ========================================================

    return {

        "message":
            "NMC results saved successfully.",

        "source_pair":
            payload.source_pair,

        "results":
            saved_results
    }
# ============================================================
# GET NMC MAPPING FOR FRONTEND
# ============================================================

@router.get("/mapping")
def get_nmc_mapping():

    response = (
        supabase
        .table("material_nmc_mapping")
        .select("*")
        .execute()
    )

    return response.data