const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://sangam-in.onrender.com";


/* =========================================================
   AI / ML BACKEND
   ========================================================= */

export async function getSampleMaterials() {
  const response = await fetch(
    `${API_URL}/api/materials-for-aiml`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to load materials"
    );
  }

  return response.json();
}


export async function standardizeMaterials() {
  const response = await fetch(
    `${API_URL}/api/run-aiml`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    const error = await response.text();

    throw new Error(
      error || "Standardization failed"
    );
  }

  return response.json();
}


/* =========================================================
   HUMAN EVALUATION
   ========================================================= */

export async function getHumanEvaluations() {
  const response = await fetch(
    `${API_URL}/api/human-evaluations`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to load human evaluations"
    );
  }

  return response.json();
}


/* =========================================================
   CREATE HUMAN EVALUATION
   ========================================================= */

export async function createHumanEvaluation(
  evaluation
) {
  const response = await fetch(
    `${API_URL}/api/human-evaluations`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(evaluation),
    }
  );

  if (!response.ok) {
    const error = await response.text();

    throw new Error(
      error || "Failed to create human evaluation"
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
  const response = await fetch(
    `${API_URL}/api/human-evaluations/${evaluationId}`,
    {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        human_decision: humanDecision,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();

    throw new Error(
      error ||
      "Failed to update human evaluation"
    );
  }

  return response.json();
}


/* =========================================================
   GET NMC MAPPINGS
   ========================================================= */

export async function getNmcMappings() {
  const response = await fetch(
    `${API_URL}/api/nmc/mapping`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to load NMC mappings"
    );
  }

  return response.json();
}