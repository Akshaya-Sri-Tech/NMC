
const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8001";

const SIH_API_URL =
  "http://127.0.0.1:8000";


/* =========================================================
   AI / ML BACKEND - PORT 8001
   ========================================================= */

export async function getSampleMaterials() {

  const response =
    await fetch(
      `${API_URL}/sample-materials`
    );

  if (!response.ok) {

    throw new Error(
      "Failed to load sample materials"
    );

  }

  return response.json();

}


export async function standardizeMaterials(
  materials
) {

  const response =
    await fetch(
      `${API_URL}/standardize`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          materials,
        }),

      }
    );


  if (!response.ok) {

    const error =
      await response.text();

    throw new Error(
      error ||
      "Standardization failed"
    );

  }

  return response.json();

}


/* =========================================================
   SIH BACKEND - PORT 8000
   ========================================================= */

export async function getHumanEvaluations() {

  const response =
    await fetch(
      `${SIH_API_URL}/api/human-evaluations`
    );


  if (!response.ok) {

    throw new Error(
      "Failed to load human evaluations"
    );

  }

  return response.json();

}


/* =========================================================
   UPDATE HUMAN EVALUATION
   ========================================================= */

export async function updateHumanEvaluation(
  evaluationId,
  humanDecision
) {

  const response =
    await fetch(
      `${SIH_API_URL}/api/human-evaluations/${evaluationId}`,
      {
        method: "PUT",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          human_decision:
            humanDecision,
        }),

      }
    );


  if (!response.ok) {

    const error =
      await response.text();

    throw new Error(
      error ||
      "Failed to update human evaluation"
    );

  }

  return response.json();

}

