from fastapi import APIRouter, HTTPException

from schemas.nmc import (
    NMCResult,
    StandardizedDescriptionUpdate
)

from services.nmc_service import (
    save_nmc_result,
    update_standardized_description
)


router = APIRouter(
    prefix="/api/nmc",
    tags=["NMC"]
)


@router.post("/results")
def receive_nmc_result(
    data: NMCResult
):

    try:

        result = save_nmc_result(data)

        return result

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


@router.put("/standardized-description")
def receive_standardized_description(
    data: StandardizedDescriptionUpdate
):

    try:

        result = update_standardized_description(data)

        return result

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )
