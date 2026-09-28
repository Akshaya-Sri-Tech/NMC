from fastapi import APIRouter, HTTPException
from database.connection import supabase
from pydantic import BaseModel
from typing import Optional, Any


router = APIRouter(
    prefix="/api/human-evaluations",
    tags=["Human Evaluation"]
)


# ------------------------------------------------
# REQUEST MODEL FOR CREATING AN EVALUATION
# ------------------------------------------------

class HumanEvaluationCreate(BaseModel):

    splink_score: Optional[float] = None
    splink_match_weight: Optional[float] = None

    left_product_id: Optional[str] = None
    left_cpse: Optional[str] = None
    left_unspsc: Optional[str] = None
    left_material_desc: Optional[str] = None
    left_technical_desc: Optional[str] = None
    left_attributes: Optional[Any] = None

    right_product_id: Optional[str] = None
    right_cpse: Optional[str] = None
    right_unspsc: Optional[str] = None
    right_material_desc: Optional[str] = None
    right_technical_desc: Optional[str] = None
    right_attributes: Optional[Any] = None

    similarities: Optional[Any] = None
    differences: Optional[Any] = None

    prototype_decision: Optional[str] = None


# ------------------------------------------------
# REQUEST MODEL FOR HUMAN DECISION
# ------------------------------------------------

class HumanDecisionUpdate(BaseModel):

    human_decision: str


# ------------------------------------------------
# POST - CREATE HUMAN EVALUATION
# ------------------------------------------------

@router.post("")
def create_human_evaluation(evaluation: HumanEvaluationCreate):

    data = evaluation.model_dump()

    data["status"] = "PENDING"

    response = (
        supabase
        .table("human_evaluations")
        .insert(data)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=500,
            detail="Failed to create human evaluation."
        )

    return {
        "message": "Human evaluation created successfully.",
        "evaluation": response.data[0]
    }


# ------------------------------------------------
# GET - GET PENDING EVALUATIONS
# ------------------------------------------------

@router.get("")
def get_human_evaluations():

    response = (
        supabase
        .table("human_evaluations")
        .select("*")
        .eq("status", "PENDING")
        .execute()
    )

    return response.data


# ------------------------------------------------
# PUT - SUBMIT HUMAN DECISION
# ------------------------------------------------

@router.put("/{evaluation_id}")
def update_human_evaluation(
    evaluation_id: str,
    decision: HumanDecisionUpdate
):

    # ------------------------------------------------
    # VALIDATE HUMAN DECISION
    # ------------------------------------------------

    if decision.human_decision not in [
        "MATCH",
        "NOT A MATCH"
    ]:
        raise HTTPException(
            status_code=400,
            detail="human_decision must be MATCH or NOT A MATCH."
        )

    # ------------------------------------------------
    # GET PENDING HUMAN EVALUATION
    # ------------------------------------------------

    evaluation_response = (
        supabase
        .table("human_evaluations")
        .select("*")
        .eq("evaluation_id", evaluation_id)
        .eq("status", "PENDING")
        .limit(1)
        .execute()
    )

    if not evaluation_response.data:
        raise HTTPException(
            status_code=404,
            detail="Pending human evaluation not found."
        )

    evaluation = evaluation_response.data[0]

    left_material_id = evaluation.get(
        "left_product_id"
    )

    right_material_id = evaluation.get(
        "right_product_id"
    )

    # ------------------------------------------------
    # COLLECT MATERIAL IDS
    # ------------------------------------------------

    material_ids = []

    if left_material_id:
        material_ids.append(
            left_material_id
        )

    if (
        right_material_id
        and right_material_id != left_material_id
    ):
        material_ids.append(
            right_material_id
        )

    if not material_ids:
        raise HTTPException(
            status_code=400,
            detail=(
                "Human evaluation does not contain "
                "valid material IDs."
            )
        )

    # ------------------------------------------------
    # HUMAN ACCEPTED THE MATCH
    # ------------------------------------------------

    if decision.human_decision == "MATCH":

        # --------------------------------------------
        # APPROVE MATERIAL MAPPING
        # --------------------------------------------

        mapping_response = (
            supabase
            .table("material_mapping")
            .update({
                "status": "APPROVED"
            })
            .in_(
                "material_id",
                material_ids
            )
            .eq(
                "status",
                "PENDING"
            )
            .execute()
        )

        if not mapping_response.data:
            raise HTTPException(
                status_code=404,
                detail=(
                    "No PENDING material_mapping records "
                    "were found for the matched materials."
                )
            )

        # --------------------------------------------
        # APPROVE HUMAN EVALUATION
        # --------------------------------------------

        evaluation_update = (
            supabase
            .table("human_evaluations")
            .update({
                "human_decision": "MATCH",
                "status": "APPROVED",
                "completed_at": "now()"
            })
            .eq(
                "evaluation_id",
                evaluation_id
            )
            .eq(
                "status",
                "PENDING"
            )
            .execute()
        )

        if not evaluation_update.data:
            raise HTTPException(
                status_code=500,
                detail=(
                    "Material mapping was approved, "
                    "but human evaluation could not "
                    "be updated."
                )
            )

        return {
            "message": (
                "Human evaluation approved and "
                "material mapping approved successfully."
            ),
            "evaluation": evaluation_update.data[0],
            "approved_mappings": mapping_response.data
        }

    # ------------------------------------------------
    # HUMAN REJECTED THE MATCH
    # ------------------------------------------------

    else:

        # --------------------------------------------
        # REJECT MATERIAL MAPPING
        # --------------------------------------------

        mapping_response = (
            supabase
            .table("material_mapping")
            .update({
                "status": "REJECTED"
            })
            .in_(
                "material_id",
                material_ids
            )
            .eq(
                "status",
                "PENDING"
            )
            .execute()
        )

        if not mapping_response.data:
            raise HTTPException(
                status_code=404,
                detail=(
                    "No PENDING material_mapping records "
                    "were found for the rejected materials."
                )
            )

        # --------------------------------------------
        # REJECT HUMAN EVALUATION
        # --------------------------------------------

        evaluation_update = (
            supabase
            .table("human_evaluations")
            .update({
                "human_decision": "NOT A MATCH",
                "status": "REJECTED",
                "completed_at": "now()"
            })
            .eq(
                "evaluation_id",
                evaluation_id
            )
            .eq(
                "status",
                "PENDING"
            )
            .execute()
        )

        if not evaluation_update.data:
            raise HTTPException(
                status_code=500,
                detail=(
                    "Material mapping was rejected, "
                    "but human evaluation could not "
                    "be updated."
                )
            )

        return {
            "message": (
                "Human evaluation rejected and "
                "material mapping rejected successfully."
            ),
            "evaluation": evaluation_update.data[0],
            "rejected_mappings": mapping_response.data
        }