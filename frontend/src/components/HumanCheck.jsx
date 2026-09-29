
import { useEffect, useMemo, useState } from "react";

import {
  Search,
  UserCheck,
  AlertTriangle,
  Eye,
  X,
  Building2,
  Package,
  GitCompare,
  Gauge,
  CheckCircle2,
  XCircle,
  MinusCircle,
} from "lucide-react";

import {
  getHumanEvaluations,
  updateHumanEvaluation,
} from "./api";


function HumanCheck() {

  const [checkData, setCheckData] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [cpseFilter, setCpseFilter] =
    useState("All CPSEs");

  const [decisionFilter, setDecisionFilter] =
    useState("All Decisions");

  const [selectedItem, setSelectedItem] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /* =========================================================
     LOAD HUMAN EVALUATIONS FROM SIH BACKEND
  ========================================================= */

  const loadHumanCheckData = async () => {

    try {

      setLoading(true);
      setError("");

      const response =
        await getHumanEvaluations();

      const evaluations =
        Array.isArray(response)
          ? response
          : [];


      /* =====================================================
         PREPARE HUMAN EVALUATION RECORDS
      ===================================================== */

      const formattedResults =
        evaluations.map((item) => {

          return {

            id:
              item.evaluation_id,

            evaluationId:
              item.evaluation_id,


            /* =================================================
               SOURCE
            ================================================= */

            sourceId:
              item.left_product_id || "-",

            sourceMaterialCode:
              item.left_product_id || "-",

            sourceMaterial:
              item.left_material_desc || "-",

            sourceCPSE:
              item.left_cpse || "-",

            sourceUNSPSC:
              item.left_unspsc || "-",

            sourceTechnical:
              item.left_technical_desc || "",

            sourceAttributes:
              item.left_attributes || "{}",


            /* =================================================
               CANDIDATE
            ================================================= */

            candidateId:
              item.right_product_id || "-",

            candidateMaterialCode:
              item.right_product_id || "-",

            candidateMaterial:
              item.right_material_desc || "-",

            candidateCPSE:
              item.right_cpse || "-",

            candidateUNSPSC:
              item.right_unspsc || "-",

            candidateTechnical:
              item.right_technical_desc || "",

            candidateAttributes:
              item.right_attributes || "{}",


            /* =================================================
               BACKEND SIMILARITIES
            ================================================= */

            similarities:
              Array.isArray(item.similarities)
                ? item.similarities
                : [],


            /* =================================================
               BACKEND DIFFERENCES
            ================================================= */

            differences:
              Array.isArray(item.differences)
                ? item.differences
                : [],


            /* =================================================
               SPLINK INFORMATION
            ================================================= */

            score:
              Number(
                item.splink_score || 0
              ),

            matchWeight:
              Number(
                item.splink_match_weight || 0
              ),


            /* =================================================
               DECISIONS / STATUS
            ================================================= */

            decision:
              item.prototype_decision ||
              "-",

            humanDecision:
              item.human_decision ||
              null,

            status:
              item.status ||
              "PENDING",

            createdAt:
              item.created_at ||
              null,

            completedAt:
              item.completed_at ||
              null,

          };

        });


      setCheckData(
        formattedResults
      );

    }

    catch (err) {

      console.error(err);

      setError(
        err.message ||
        "Unable to load human verification data."
      );

    }

    finally {

      setLoading(false);

    }

  };


  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {

    loadHumanCheckData();

  }, []);


  /* =========================================================
     HUMAN DECISION
     
     MATCH
     NOT A MATCH
  ========================================================= */

  const handleHumanDecision = async (
    decision
  ) => {

    if (!selectedItem) {
      return;
    }


    try {

      setLoading(true);


      await updateHumanEvaluation(
        selectedItem.evaluationId,
        decision
      );


      alert(
        decision === "MATCH"
          ? "Match approved successfully."
          : "Match rejected successfully."
      );


      /* Close comparison panel */

      setSelectedItem(null);


      /* Reload pending evaluations */

      await loadHumanCheckData();

    }

    catch (err) {

      console.error(err);

      alert(
        err.message ||
        "Failed to update human evaluation."
      );

      setLoading(false);

    }

  };


  /* =========================================================
     FILTER OPTIONS
  ========================================================= */

  const cpseOptions = useMemo(() => {

    const values = [
      ...new Set(
        checkData
          .map(
            (item) =>
              item.sourceCPSE
          )
          .filter(
            (cpse) =>
              cpse &&
              cpse !== "-" &&
              cpse.trim() !== ""
          )
          .map(
            (cpse) =>
              cpse.trim()
          )
      ),
    ];

    return [
      "All CPSEs",
      ...values,
    ];

  }, [checkData]);


  const decisionOptions = useMemo(() => {

    const values = [
      ...new Set(
        checkData
          .map(
            (item) =>
              item.decision
          )
          .filter(
            (decision) =>
              decision &&
              decision !== "-"
          )
      ),
    ];

    return [
      "All Decisions",
      ...values,
    ];

  }, [checkData]);


  /* =========================================================
     FILTER RESULTS
  ========================================================= */

  const filteredData = useMemo(() => {

    const search =
      searchTerm
        .trim()
        .toLowerCase();


    return checkData.filter(
      (item) => {

        const matchesSearch =
          !search ||

          item.sourceMaterial
            .toLowerCase()
            .includes(search) ||

          item.sourceMaterialCode
            .toLowerCase()
            .includes(search) ||

          item.sourceCPSE
            .toLowerCase()
            .includes(search) ||

          item.candidateMaterial
            .toLowerCase()
            .includes(search) ||

          item.candidateMaterialCode
            .toLowerCase()
            .includes(search) ||

          item.candidateCPSE
            .toLowerCase()
            .includes(search);


        const matchesCPSE =
          cpseFilter === "All CPSEs" ||

          item.sourceCPSE
            ?.trim()
            .toLowerCase() ===
          cpseFilter
            .trim()
            .toLowerCase();


        const matchesDecision =
          decisionFilter ===
            "All Decisions" ||

          item.decision ===
            decisionFilter;


        return (
          matchesSearch &&
          matchesCPSE &&
          matchesDecision
        );

      }
    );

  }, [
    checkData,
    searchTerm,
    cpseFilter,
    decisionFilter,
  ]);


  /* =========================================================
     SUMMARY
  ========================================================= */

  const totalChecks =
    checkData.length;


  const matchCount =
    checkData.filter(
      (item) =>
        item.decision === "MATCH"
    ).length;


  const newCodeCount =
    checkData.filter(
      (item) =>
        item.decision ===
        "NEW_NMC_CODE"
    ).length;


  /* =========================================================
     SCORE FORMATTER
  ========================================================= */

  const formatScore = (score) => {

    if (
      score === null ||
      score === undefined
    ) {
      return "-";
    }

    return Number(score).toFixed(4);

  };


  /* =========================================================
     ATTRIBUTE PARSER
  ========================================================= */

  const parseAttributes = (value) => {

    try {

      if (!value) {
        return [];
      }

      const parsed =
        typeof value === "string"
          ? JSON.parse(value)
          : value;


      if (
        !parsed ||
        typeof parsed !== "object"
      ) {
        return [];
      }


      return Object.entries(parsed);

    }

    catch {

      return [];

    }

  };


  /* =========================================================
     LOADING
  ========================================================= */

  if (loading && checkData.length === 0) {

    return (

      <div className="human-check-page">

        <div className="human-check-loading">

          <div className="human-check-loading-icon">

            <UserCheck size={25} />

          </div>


          <h2>
            Loading Human Verification Queue
          </h2>


          <p>
            Fetching pending human evaluations
            from the backend...
          </p>

        </div>

      </div>

    );

  }


  /* =========================================================
     ERROR
  ========================================================= */

  if (error && checkData.length === 0) {

    return (

      <div className="human-check-page">

        <div className="human-check-error">

          <AlertTriangle size={30} />


          <h2>
            Unable to Load Human Check
          </h2>


          <p>
            {error}
          </p>


          <p>
            Make sure the SIH backend is running
            on port 8000.
          </p>

        </div>

      </div>

    );

  }


  /* =========================================================
     MAIN PAGE
  ========================================================= */

  return (

    <div className="human-check-page">


      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="human-check-header">

        <div>

          <div className="human-check-title-row">

            <UserCheck size={25} />

            <h1>
              Human Verification
            </h1>

          </div>


          <p>
            Validate backend-generated material
            matching results before standardization.
          </p>

        </div>

      </div>


      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="human-check-summary">


        <div className="human-check-summary-card">

          <div className="human-check-summary-icon">

            <UserCheck size={20} />

          </div>


          <div>

            <span>
              Total Comparisons
            </span>

            <strong>
              {totalChecks}
            </strong>

          </div>

        </div>


        <div className="human-check-summary-card">

          <div className="human-check-summary-icon">

            <CheckCircle2 size={20} />

          </div>


          <div>

            <span>
              Backend Matches
            </span>

            <strong>
              {matchCount}
            </strong>

          </div>

        </div>


        <div className="human-check-summary-card">

          <div className="human-check-summary-icon">

            <AlertTriangle size={20} />

          </div>


          <div>

            <span>
              New Code Decisions
            </span>

            <strong>
              {newCodeCount}
            </strong>

          </div>

        </div>

      </div>


      {/* =====================================================
          TOOLBAR
      ===================================================== */}

      <div className="human-check-toolbar">


        <div className="human-check-search">

          <Search size={18} />


          <input
            type="text"
            placeholder="Search material, ID or CPSE..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(
                e.target.value
              )
            }
          />

        </div>


        <select
          value={cpseFilter}
          onChange={(e) =>
            setCpseFilter(
              e.target.value
            )
          }
        >

          {cpseOptions.map(
            (cpse) => (

              <option
                key={cpse}
                value={cpse}
              >
                {cpse}
              </option>

            )
          )}

        </select>


        <select
          value={decisionFilter}
          onChange={(e) =>
            setDecisionFilter(
              e.target.value
            )
          }
        >

          {decisionOptions.map(
            (decision) => (

              <option
                key={decision}
                value={decision}
              >
                {decision}
              </option>

            )
          )}

        </select>

      </div>


      {/* =====================================================
          RESULT COUNT
      ===================================================== */}

      <div className="human-check-result-info">

        Showing{" "}

        <strong>
          {filteredData.length}
        </strong>{" "}

        of{" "}

        <strong>
          {checkData.length}
        </strong>{" "}

        comparisons

      </div>


      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="human-check-table-container">


        {filteredData.length === 0 ? (

          <div className="human-check-empty">

            <Package size={32} />


            <h3>
              No verification records found
            </h3>


            <p>
              Try changing the search or
              filters.
            </p>

          </div>

        ) : (

          <table className="human-check-table">

            <thead>

              <tr>

                <th>
                  SOURCE MATERIAL
                </th>

                <th>
                  CPSE
                </th>

                <th>
                  CANDIDATE MATERIAL
                </th>

                <th>
                  CANDIDATE CPSE
                </th>

                <th>
                  SCORE
                </th>

                <th>
                  BACKEND DECISION
                </th>

                <th>
                  ACTION
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredData.map(
                (item) => (

                  <tr
                    key={item.id}
                  >


                    {/* SOURCE */}

                    <td>

                      <div className="human-check-material">

                        <strong>
                          {item.sourceMaterialCode}
                        </strong>

                        <small>
                          {item.sourceMaterial}
                        </small>

                      </div>

                    </td>


                    {/* SOURCE CPSE */}

                    <td>

                      <div className="human-check-cpse">

                        <Building2 size={15} />

                        {item.sourceCPSE}

                      </div>

                    </td>


                    {/* CANDIDATE */}

                    <td>

                      <div className="human-check-material candidate">

                        <strong>
                          {item.candidateMaterialCode}
                        </strong>

                        <small>
                          {item.candidateMaterial}
                        </small>

                      </div>

                    </td>


                    {/* CANDIDATE CPSE */}

                    <td>

                      <div className="human-check-cpse">

                        <Building2 size={15} />

                        {item.candidateCPSE}

                      </div>

                    </td>


                    {/* SCORE */}

                    <td>

                      <span
                        className={
                          item.score >= 0.99
                            ? "human-check-score high"
                            : item.score >= 0.8
                            ? "human-check-score medium"
                            : "human-check-score low"
                        }
                      >

                        {formatScore(
                          item.score
                        )}

                      </span>

                    </td>


                    {/* DECISION */}

                    <td>

                      <span
                        className={
                          item.decision ===
                          "MATCH"
                            ? "human-check-decision match"
                            : item.decision ===
                              "NEW_NMC_CODE"
                            ? "human-check-decision new-code"
                            : "human-check-decision"
                        }
                      >

                        {item.decision}

                      </span>

                    </td>


                    {/* ACTION */}

                    <td>

                      <button
                        className="human-check-review-button"
                        onClick={() =>
                          setSelectedItem(
                            item
                          )
                        }
                      >

                        <Eye size={16} />

                        Compare

                      </button>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        )}

      </div>


      {/* =====================================================
          COMPARISON PANEL
      ===================================================== */}

      {selectedItem && (

        <div
          className="human-check-overlay"
          onClick={() =>
            setSelectedItem(null)
          }
        >

          <div
            className="human-check-panel"
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            {/* =================================================
                PANEL HEADER
            ================================================= */}

            <div className="human-check-panel-header">

              <div>

                <span>
                  HUMAN VERIFICATION
                </span>

                <h2>
                  Material Comparison
                </h2>

              </div>


              <button
                className="human-check-close"
                onClick={() =>
                  setSelectedItem(null)
                }
              >

                <X size={20} />

              </button>

            </div>


            {/* =================================================
                MATCH SUMMARY
            ================================================= */}

            <div className="human-check-match-summary">


              <div>

                <span>
                  SPLINK SCORE
                </span>

                <strong>
                  {formatScore(
                    selectedItem.score
                  )}
                </strong>

              </div>


              <div>

                <span>
                  MATCH WEIGHT
                </span>

                <strong>
                  {selectedItem.matchWeight.toFixed(
                    2
                  )}
                </strong>

              </div>


              <div>

                <span>
                  BACKEND DECISION
                </span>

                <strong>
                  {selectedItem.decision}
                </strong>

              </div>

            </div>


            {/* =================================================
                SIDE BY SIDE MATERIAL DETAILS
            ================================================= */}

            <div className="human-check-comparison">


              {/* SOURCE */}

              <div className="human-check-column">


                <div className="human-check-column-header">

                  <Package size={18} />

                  <div>

                    <span>
                      SOURCE MATERIAL
                    </span>

                    <strong>
                      {selectedItem.sourceMaterialCode}
                    </strong>

                  </div>

                </div>


                <div className="human-check-info">

                  <label>
                    Material
                  </label>

                  <strong>
                    {selectedItem.sourceMaterial}
                  </strong>

                </div>


                <div className="human-check-info">

                  <label>
                    CPSE
                  </label>

                  <strong>
                    {selectedItem.sourceCPSE}
                  </strong>

                </div>


                <div className="human-check-info">

                  <label>
                    UNSPSC
                  </label>

                  <strong>
                    {selectedItem.sourceUNSPSC}
                  </strong>

                </div>


                <div className="human-check-info">

                  <label>
                    Technical Description
                  </label>

                  <p>
                    {selectedItem.sourceTechnical ||
                      "Not available"}
                  </p>

                </div>

              </div>


              {/* VS */}

              <div className="human-check-vs">

                <GitCompare size={21} />

                <span>
                  VS
                </span>

              </div>


              {/* CANDIDATE */}

              <div className="human-check-column candidate-column">


                <div className="human-check-column-header">

                  <GitCompare size={18} />

                  <div>

                    <span>
                      CANDIDATE MATERIAL
                    </span>

                    <strong>
                      {selectedItem.candidateMaterialCode}
                    </strong>

                  </div>

                </div>


                <div className="human-check-info">

                  <label>
                    Material
                  </label>

                  <strong>
                    {selectedItem.candidateMaterial}
                  </strong>

                </div>


                <div className="human-check-info">

                  <label>
                    CPSE
                  </label>

                  <strong>
                    {selectedItem.candidateCPSE}
                  </strong>

                </div>


                <div className="human-check-info">

                  <label>
                    UNSPSC
                  </label>

                  <strong>
                    {selectedItem.candidateUNSPSC}
                  </strong>

                </div>


                <div className="human-check-info">

                  <label>
                    Technical Description
                  </label>

                  <p>
                    {selectedItem.candidateTechnical ||
                      "Not available"}
                  </p>

                </div>

              </div>

            </div>


            {/* =================================================
                BACKEND SIMILARITIES + DIFFERENCES
            ================================================= */}

            <div className="human-check-backend-results">


              {/* SIMILARITIES */}

              <div className="human-check-result-section similarities">


                <div className="human-check-result-title">

                  <CheckCircle2 size={17} />

                  Identified Similarities

                </div>


                {selectedItem.similarities.length > 0 ? (

                  <ul>

                    {selectedItem.similarities.map(
                      (similarity, index) => (

                        <li
                          key={index}
                        >
                          {similarity}
                        </li>

                      )
                    )}

                  </ul>

                ) : (

                  <p>
                    No similarities identified by
                    the backend.
                  </p>

                )}

              </div>


              {/* DIFFERENCES */}

              <div className="human-check-result-section differences">


                <div className="human-check-result-title">

                  <AlertTriangle size={17} />

                  Identified Differences

                </div>


                {selectedItem.differences.length > 0 ? (

                  <ul>

                    {selectedItem.differences.map(
                      (difference, index) => (

                        <li
                          key={index}
                        >
                          {difference}
                        </li>

                      )
                    )}

                  </ul>

                ) : (

                  <p>
                    No differences identified by
                    the backend.
                  </p>

                )}

              </div>

            </div>


            {/* =================================================
                RAW ATTRIBUTE COMPARISON
            ================================================= */}

            <div className="human-check-attributes">

              <div className="human-check-attributes-title">

                <Gauge size={17} />

                Extracted Attributes

              </div>


              <div className="human-check-attribute-grid">


                {/* SOURCE ATTRIBUTES */}

                <div>

                  <label>
                    Source Attributes
                  </label>


                  {parseAttributes(
                    selectedItem.sourceAttributes
                  ).length > 0 ? (

                    parseAttributes(
                      selectedItem.sourceAttributes
                    ).map(
                      ([key, value]) => (

                        <div
                          className="human-check-attribute-row"
                          key={key}
                        >

                          <span>
                            {key}
                          </span>

                          <strong>
                            {String(value)}
                          </strong>

                        </div>

                      )
                    )

                  ) : (

                    <p>
                      No structured attributes
                      available.
                    </p>

                  )}

                </div>


                {/* CANDIDATE ATTRIBUTES */}

                <div>

                  <label>
                    Candidate Attributes
                  </label>


                  {parseAttributes(
                    selectedItem.candidateAttributes
                  ).length > 0 ? (

                    parseAttributes(
                      selectedItem.candidateAttributes
                    ).map(
                      ([key, value]) => (

                        <div
                          className="human-check-attribute-row"
                          key={key}
                        >

                          <span>
                            {key}
                          </span>

                          <strong>
                            {String(value)}
                          </strong>

                        </div>

                      )
                    )

                  ) : (

                    <p>
                      No structured attributes
                      available.
                    </p>

                  )}

                </div>

              </div>

            </div>


            {/* =================================================
                HUMAN ACTION AREA
            ================================================= */}

            <div className="human-check-action-area">


              <div>

                <strong>
                  Human decision
                </strong>

                <p>
                  Review the backend-identified
                  similarities and differences before
                  making a validation decision.
                </p>

              </div>


              <div className="human-check-actions">


                {/* APPROVE */}

                <button
                  className="human-check-action approve"
                  onClick={() =>
                    handleHumanDecision(
                      "MATCH"
                    )
                  }
                  disabled={loading}
                >

                  <CheckCircle2 size={17} />

                  {loading
                    ? "Updating..."
                    : "Approve Match"}

                </button>


                {/* REJECT */}

                <button
                  className="human-check-action reject"
                  onClick={() =>
                    handleHumanDecision(
                      "NOT A MATCH"
                    )
                  }
                  disabled={loading}
                >

                  <XCircle size={17} />

                  {loading
                    ? "Updating..."
                    : "Reject Match"}

                </button>


                {/* CONDITIONAL */}

                <button
                  className="human-check-action conditional"
                  onClick={() =>
                    alert(
                      "Conditional action is not currently supported by the backend."
                    )
                  }
                  disabled={loading}
                >

                  <MinusCircle size={17} />

                  Mark Conditional

                </button>

              </div>

            </div>


          </div>

        </div>

      )}

    </div>

  );

}


export default HumanCheck;

