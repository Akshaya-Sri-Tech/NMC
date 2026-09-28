from fastapi import APIRouter, HTTPException

from schemas.nmc import (
    NMCResultsRequest,
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
    data: NMCResultsRequest
):

    try:

        # --------------------------------------------------
        # Validate that the pair contains both results
        # --------------------------------------------------

        if len(data.results) != 2:

            raise ValueError(
                "NMC result must contain exactly two "
                "material results for the source pair."
            )

        # --------------------------------------------------
        # Verify that the results correspond to the pair
        # --------------------------------------------------

        result_material_ids = {
            result.material_id
            for result in data.results
        }

        expected_material_ids = {
            data.source_pair.left_material_id,
            data.source_pair.right_material_id
        }

        if result_material_ids != expected_material_ids:

            raise ValueError(
                "NMC result material IDs do not match "
                "the source pair."
            )

        # --------------------------------------------------
        # Save both material results
        # --------------------------------------------------

        saved_results = []

        for result in data.results:

            saved_result = save_nmc_result(
                result
            )

            saved_results.append(
                saved_result
            )

        # --------------------------------------------------
        # Return pair-level response
        # --------------------------------------------------

        return {
            "message": "NMC pair results stored successfully",

            "source_pair": {
                "left_material_id":
                    data.source_pair.left_material_id,

                "right_material_id":
                    data.source_pair.right_material_id,

                "splink_score":
                    data.source_pair.splink_score,

                "prototype_decision":
                    data.source_pair.prototype_decision
            },

            "results": saved_results
        }

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

        result = update_standardized_description(
            data
        )

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