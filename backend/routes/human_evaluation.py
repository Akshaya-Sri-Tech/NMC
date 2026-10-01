
from fastapi import APIRouter, HTTPException
from backend.database.connection import supabase
from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime, timezone


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
def create_human_evaluation(
    evaluation: HumanEvaluationCreate
):

    data = evaluation.model_dump()

    # Every new evaluation starts as PENDING
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
# GET - GET ONE HUMAN EVALUATION
# ------------------------------------------------

@router.get("/{evaluation_id}")
def get_human_evaluation(
    evaluation_id: str
):

    response = (
        supabase
        .table("human_evaluations")
        .select("*")
        .eq(
            "evaluation_id",
            evaluation_id
        )
        .limit(1)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="Human evaluation not found."
        )

    return response.data[0]


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
            detail=(
                "human_decision must be "
                "MATCH or NOT A MATCH."
            )
        )

    # ------------------------------------------------
    # DETERMINE NEW STATUS
    # ------------------------------------------------

    if decision.human_decision == "MATCH":

        new_status = "APPROVED"

    else:

        new_status = "REJECTED"

    # ------------------------------------------------
    # UPDATE HUMAN EVALUATION
    # ------------------------------------------------

    response = (
        supabase
        .table("human_evaluations")
        .update({
            "human_decision":
                decision.human_decision,

            "status":
                new_status,

            "completed_at":
                datetime.now(
                    timezone.utc
                ).isoformat()
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

    # ------------------------------------------------
    # CHECK WHETHER UPDATE SUCCEEDED
    # ------------------------------------------------

    if not response.data:

        raise HTTPException(
            status_code=404,
            detail=(
                "Pending human evaluation "
                "not found."
            )
        )

    # ------------------------------------------------
    # FINAL RESPONSE
    # ------------------------------------------------

    return {

        "message": (
            f"Human evaluation "
            f"{new_status.lower()} successfully."
        ),

        "evaluation":
            response.data[0]
    }

