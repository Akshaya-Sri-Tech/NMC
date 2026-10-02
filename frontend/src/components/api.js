const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://sangam-in.onrender.com";


/* =========================================================
   AI / ML BACKEND
   ========================================================= */

/**
 * Get sample materials from backend.
 *
 * Backend may return either:
 *   [...]
 * or:
 *   { materials: [...] }
 *
 * This function normalizes both formats into:
 *   { materials: [...] }
 */
export async function getSampleMaterials() {
  const response = await fetch(
    `${API_URL}/api/materials-for-aiml`
  );

  if (!response.ok) {
    const error = await response.text();

    throw new Error(
      error || "Failed to load materials"
    );
  }

  const data = await response.json();

  // Backend returns an array
  if (Array.isArray(data)) {
    return {
      materials: data,
    };
  }

  // Backend returns { materials: [...] }
  if (data && Array.isArray(data.materials)) {
    return {
      materials: data.materials,
    };
  }

  // Unexpected response
  return {
    materials: [],
  };
}


/**
 * Run the AI/ML standardization pipeline.
 */
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

/**
 * Get all human evaluations.
 */
export async function getHumanEvaluations() {
  const response = await fetch(
    `${API_URL}/api/human-evaluations`
  );

  if (!response.ok) {
    const error = await response.text();

    throw new Error(
      error || "Failed to load human evaluations"
    );
  }

  return response.json();
}


/* =========================================================
   CREATE HUMAN EVALUATION
   ========================================================= */

/**
 * Create a new human evaluation.
 */
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

/**
 * Update the human decision for an evaluation.
 */
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
   NMC MAPPINGS
   ========================================================= */

/**
 * Get NMC mappings.
 */
export async function getNmcMappings() {
  const response = await fetch(
    `${API_URL}/api/nmc/mapping`
  );

  if (!response.ok) {
    const error = await response.text();

    throw new Error(
      error || "Failed to load NMC mappings"
    );
  }

  return response.json();
}