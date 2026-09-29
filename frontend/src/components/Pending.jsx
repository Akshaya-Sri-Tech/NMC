
import { useEffect, useMemo, useState } from "react";

import {
  Search,
  Clock3,
  AlertTriangle,
  Eye,
  X,
  Building2,
  Package,
  Gauge,
  GitCompare,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import {
  getHumanEvaluations,
  updateHumanEvaluation,
} from "./api";


function Pending() {

  const [pendingData, setPendingData] =
    useState([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [cpseFilter, setCpseFilter] =
    useState("All CPSEs");

  const [statusFilter, setStatusFilter] =
    useState("All Statuses");

  const [selectedItem, setSelectedItem] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /* =========================================================
     LOAD PENDING EVALUATIONS FROM SIH BACKEND
  ========================================================= */

  useEffect(() => {

    async function loadPendingData() {

      try {

        setLoading(true);
        setError("");

        const response =
          await getHumanEvaluations();


        const evaluations =
          Array.isArray(response)
            ? response
            : response.evaluations || [];


        /* =====================================================
           CONVERT BACKEND EVALUATIONS
        ===================================================== */

        const formattedResults =
          evaluations.map((item) => {

            let leftAttributes = {};
            let rightAttributes = {};


            /* LEFT ATTRIBUTES */

            try {

              leftAttributes =
                typeof item.left_attributes === "string"
                  ? JSON.parse(
                      item.left_attributes
                    )
                  : item.left_attributes || {};

            } catch {

              leftAttributes = {};

            }


            /* RIGHT ATTRIBUTES */

            try {

              rightAttributes =
                typeof item.right_attributes === "string"
                  ? JSON.parse(
                      item.right_attributes
                    )
                  : item.right_attributes || {};

            } catch {

              rightAttributes = {};

            }


            return {

              /* EVALUATION */

              id:
                item.evaluation_id,


              /* SOURCE */

              materialId:
                item.left_product_id || "-",

              materialCode:
                item.left_product_id || "-",

              material:
                item.left_material_desc || "-",

              cpse:
                item.left_cpse || "-",

              cpseName:
                item.left_cpse || "-",


              category:
                leftAttributes.product_type ||
                leftAttributes.material_group ||
                "-",


              specification:
                item.left_technical_desc || "-",


              /* CANDIDATE */

              candidateMaterialCode:
                item.right_product_id || "-",

              candidateMaterial:
                item.right_material_desc || "-",

              candidateCPSE:
                item.right_cpse || "-",

              candidateCPSEName:
                item.right_cpse || "-",


              candidateSpecification:
                item.right_technical_desc || "-",


              /* MATCHING INFORMATION */

              score:
                Number(
                  item.splink_score || 0
                ),

              matchWeight:
                Number(
                  item.splink_match_weight || 0
                ),


              /* STATUS */

              status:
                item.status || "PENDING",


              decision:
                item.status || "PENDING",


              /* TECHNICAL DETAILS */

              technicalDescription:
                item.left_technical_desc || "",

              candidateTechnicalDescription:
                item.right_technical_desc || "",


              /* UNSPSC */

              unspsc:
                item.left_unspsc || "-",

              candidateUNSPSC:
                item.right_unspsc || "-",


              /* ATTRIBUTES */

              attributes:
                leftAttributes,

              candidateAttributes:
                rightAttributes,


              /* MATCH EXPLANATION */

              similarities:
                Array.isArray(item.similarities)
                  ? item.similarities
                  : [],

              differences:
                Array.isArray(item.differences)
                  ? item.differences
                  : [],

            };

          });


        setPendingData(
          formattedResults
        );

      }

      catch (err) {

        console.error(
          "Failed to load pending evaluations:",
          err
        );

        setError(
          err.message ||
          "Unable to load pending materials."
        );

      }

      finally {

        setLoading(false);

      }

    }


    loadPendingData();

  }, []);


  /* =========================================================
     HUMAN VALIDATION
  ========================================================= */

  const handleDecision = async (
    decision
  ) => {

    if (!selectedItem) {
      return;
    }


    try {

      setLoading(true);


      await updateHumanEvaluation(
        selectedItem.id,
        decision
      );


      alert(
        decision === "MATCH"
          ? "Match approved successfully."
          : "Match rejected successfully."
      );


      setSelectedItem(null);


      /*
        Reload the pending records.

        The backend GET endpoint only returns
        PENDING evaluations.

        Therefore the completed record will
        disappear from this page.
      */

      const response =
        await getHumanEvaluations();


      const evaluations =
        Array.isArray(response)
          ? response
          : response.evaluations || [];


      const formattedResults =
        evaluations.map((item) => {

          let leftAttributes = {};
          let rightAttributes = {};


          try {

            leftAttributes =
              typeof item.left_attributes === "string"
                ? JSON.parse(
                    item.left_attributes
                  )
                : item.left_attributes || {};

          } catch {

            leftAttributes = {};

          }


          try {

            rightAttributes =
              typeof item.right_attributes === "string"
                ? JSON.parse(
                    item.right_attributes
                  )
                : item.right_attributes || {};

          } catch {

            rightAttributes = {};

          }


          return {

            id:
              item.evaluation_id,

            materialId:
              item.left_product_id || "-",

            materialCode:
              item.left_product_id || "-",

            material:
              item.left_material_desc || "-",

            cpse:
              item.left_cpse || "-",

            cpseName:
              item.left_cpse || "-",

            category:
              leftAttributes.product_type ||
              leftAttributes.material_group ||
              "-",

            specification:
              item.left_technical_desc || "-",

            candidateMaterialCode:
              item.right_product_id || "-",

            candidateMaterial:
              item.right_material_desc || "-",

            candidateCPSE:
              item.right_cpse || "-",

            candidateCPSEName:
              item.right_cpse || "-",

            candidateSpecification:
              item.right_technical_desc || "-",

            score:
              Number(
                item.splink_score || 0
              ),

            matchWeight:
              Number(
                item.splink_match_weight || 0
              ),

            status:
              item.status || "PENDING",

            decision:
              item.status || "PENDING",

            technicalDescription:
              item.left_technical_desc || "",

            candidateTechnicalDescription:
              item.right_technical_desc || "",

            unspsc:
              item.left_unspsc || "-",

            candidateUNSPSC:
              item.right_unspsc || "-",

            attributes:
              leftAttributes,

            candidateAttributes:
              rightAttributes,

            similarities:
              Array.isArray(item.similarities)
                ? item.similarities
                : [],

            differences:
              Array.isArray(item.differences)
                ? item.differences
                : [],

          };

        });


      setPendingData(
        formattedResults
      );

    }

    catch (err) {

      console.error(
        "Failed to update evaluation:",
        err
      );

      alert(
        err.message ||
        "Failed to update human evaluation."
      );

      setLoading(false);

    }

  };


  /* =========================================================
     CPSE FILTER OPTIONS
  ========================================================= */

  const cpseOptions = useMemo(() => {

    const values = [
      ...new Set(
        pendingData
          .map(
            (item) =>
              item.cpse
          )
          .filter(
            (cpse) =>
              cpse &&
              cpse !== "-"
          )
      ),
    ];


    return [
      "All CPSEs",
      ...values,
    ];

  }, [pendingData]);


  /* =========================================================
     STATUS FILTER OPTIONS
  ========================================================= */

  const statusOptions = useMemo(() => {

    const values = [
      ...new Set(
        pendingData
          .map(
            (item) =>
              item.status
          )
      ),
    ];


    return [
      "All Statuses",
      ...values,
    ];

  }, [pendingData]);


  /* =========================================================
     FILTER DATA
  ========================================================= */

  const filteredData = useMemo(() => {

    const search =
      searchTerm
        .trim()
        .toLowerCase();


    return pendingData.filter(
      (item) => {

        const matchesSearch =
          !search ||

          String(
            item.materialCode || ""
          )
            .toLowerCase()
            .includes(search) ||

          String(
            item.material || ""
          )
            .toLowerCase()
            .includes(search) ||

          String(
            item.cpse || ""
          )
            .toLowerCase()
            .includes(search) ||

          String(
            item.cpseName || ""
          )
            .toLowerCase()
            .includes(search) ||

          String(
            item.candidateMaterialCode || ""
          )
            .toLowerCase()
            .includes(search) ||

          String(
            item.candidateMaterial || ""
          )
            .toLowerCase()
            .includes(search);


        const matchesCPSE =
          cpseFilter === "All CPSEs" ||
          item.cpse === cpseFilter;


        const matchesStatus =
          statusFilter === "All Statuses" ||
          item.status === statusFilter;


        return (
          matchesSearch &&
          matchesCPSE &&
          matchesStatus
        );

      }
    );

  }, [
    pendingData,
    searchTerm,
    cpseFilter,
    statusFilter,
  ]);


  /* =========================================================
     STATISTICS
  ========================================================= */

  const totalPending =
    pendingData.length;


  const highConfidenceCount =
    pendingData.filter(
      (item) =>
        item.score >= 0.99
    ).length;


  const requiresReviewCount =
    pendingData.filter(
      (item) =>
        item.score < 0.99
    ).length;


  /* =========================================================
     SCORE FORMAT
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
     LOADING
  ========================================================= */

  if (loading) {

    return (

      <div className="pending-page">

        <div className="pending-loading">

          <div className="pending-loading-icon">

            <Clock3 size={24} />

          </div>


          <h2>
            Loading Pending Materials
          </h2>


          <p>
            Fetching pending material evaluations
            from the backend...
          </p>

        </div>

      </div>

    );

  }


  /* =========================================================
     ERROR
  ========================================================= */

  if (error) {

    return (

      <div className="pending-page">

        <div className="pending-error">

          <AlertTriangle size={30} />


          <h2>
            Unable to Load Pending Materials
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
     MAIN UI
  ========================================================= */

  return (

    <div className="pending-page">


      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="pending-header">

        <div>

          <div className="pending-title-row">

            <Clock3 size={25} />

            <h1>
              Pending Material Standardization
            </h1>

          </div>


          <p>
            Review material matches and records
            requiring further standardization.
          </p>

        </div>

      </div>


      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="pending-summary">


        {/* TOTAL PENDING */}

        <div className="pending-summary-card">

          <div className="pending-summary-icon">

            <Clock3 size={20} />

          </div>


          <div>

            <span>
              Total Pending
            </span>

            <strong>
              {totalPending}
            </strong>

          </div>

        </div>


        {/* HIGH CONFIDENCE */}

        <div className="pending-summary-card">

          <div className="pending-summary-icon">

            <Gauge size={20} />

          </div>


          <div>

            <span>
              High Confidence
            </span>

            <strong>
              {highConfidenceCount}
            </strong>

          </div>

        </div>


        {/* REQUIRES REVIEW */}

        <div className="pending-summary-card">

          <div className="pending-summary-icon">

            <GitCompare size={20} />

          </div>


          <div>

            <span>
              Requires Review
            </span>

            <strong>
              {requiresReviewCount}
            </strong>

          </div>

        </div>

      </div>


      {/* =====================================================
          FILTER BAR
      ===================================================== */}

      <div className="pending-toolbar">


        {/* SEARCH */}

        <div className="pending-search">

          <Search size={18} />


          <input
            type="text"
            placeholder="Search material, product ID or CPSE..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(
                e.target.value
              )
            }
          />

        </div>


        {/* CPSE FILTER */}

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


        {/* STATUS FILTER */}

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value
            )
          }
        >

          {statusOptions.map(
            (status) => (

              <option
                key={status}
                value={status}
              >
                {status}
              </option>

            )
          )}

        </select>

      </div>


      {/* =====================================================
          RESULT COUNT
      ===================================================== */}

      <div className="pending-result-info">

        Showing{" "}

        <strong>
          {filteredData.length}
        </strong>{" "}

        of{" "}

        <strong>
          {pendingData.length}
        </strong>{" "}

        pending records

      </div>


      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="pending-table-container">


        {filteredData.length === 0 ? (

          <div className="pending-empty">

            <Package size={32} />


            <h3>
              No pending records found
            </h3>


            <p>
              Try changing the search or filters.
            </p>

          </div>

        ) : (

          <table className="pending-table">

            <thead>

              <tr>

                <th>
                  PRODUCT ID
                </th>

                <th>
                  MATERIAL
                </th>

                <th>
                  CPSE
                </th>

                <th>
                  CANDIDATE MATERIAL
                </th>

                <th>
                  MATCH SCORE
                </th>

                <th>
                  STATUS
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

                    {/* PRODUCT ID */}

                    <td>

                      <span className="pending-material-code">

                        {item.materialCode}

                      </span>

                    </td>


                    {/* MATERIAL */}

                    <td>

                      <div className="pending-material-cell">

                        <strong>
                          {item.material}
                        </strong>

                        <small>
                          {item.category}
                        </small>

                      </div>

                    </td>


                    {/* CPSE */}

                    <td>

                      <div className="pending-cpse">

                        <Building2 size={15} />

                        <span>
                          {item.cpse}
                        </span>

                      </div>

                    </td>


                    {/* CANDIDATE MATERIAL */}

                    <td>

                      <div className="pending-candidate">

                        <strong>
                          {item.candidateMaterialCode}
                        </strong>

                        <small>
                          {item.candidateMaterial}
                        </small>

                      </div>

                    </td>


                    {/* MATCH SCORE */}

                    <td>

                      <span
                        className={
                          item.score >= 0.99
                            ? "pending-score high"
                            : "pending-score medium"
                        }
                      >

                        {formatScore(
                          item.score
                        )}

                      </span>

                    </td>


                    {/* STATUS */}

                    <td>

                      <span
                        className={
                          item.status === "PENDING"
                            ? "pending-decision review"
                            : "pending-decision"
                        }
                      >

                        {item.status}

                      </span>

                    </td>


                    {/* ACTION */}

                    <td>

                      <button
                        className="pending-review-button"
                        onClick={() =>
                          setSelectedItem(
                            item
                          )
                        }
                      >

                        <Eye size={16} />

                        Review

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
          DETAIL PANEL
      ===================================================== */}

      {selectedItem && (

        <div
          className="pending-overlay"
          onClick={() =>
            setSelectedItem(null)
          }
        >


          <div
            className="pending-detail-panel"
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            {/* =================================================
                DETAIL HEADER
            ================================================= */}

            <div className="pending-detail-header">

              <div>

                <span>
                  MATERIAL REVIEW
                </span>

                <h2>
                  {selectedItem.materialCode}
                </h2>

              </div>


              <button
                className="pending-close-button"
                onClick={() =>
                  setSelectedItem(null)
                }
              >

                <X size={20} />

              </button>

            </div>


            {/* =================================================
                SOURCE MATERIAL
            ================================================= */}

            <div className="pending-detail-section">

              <div className="pending-section-title">

                <Package size={17} />

                Source Material

              </div>


              <div className="pending-detail-grid">

                <div>

                  <label>
                    Product ID
                  </label>

                  <strong>
                    {selectedItem.materialCode}
                  </strong>

                </div>


                <div>

                  <label>
                    CPSE
                  </label>

                  <strong>
                    {selectedItem.cpse}
                  </strong>

                </div>


                <div className="full">

                  <label>
                    Material
                  </label>

                  <strong>
                    {selectedItem.material}
                  </strong>

                </div>


                <div className="full">

                  <label>
                    Technical Description
                  </label>

                  <p>
                    {selectedItem.specification}
                  </p>

                </div>

              </div>

            </div>


            {/* =================================================
                CANDIDATE MATERIAL
            ================================================= */}

            <div className="pending-detail-section">

              <div className="pending-section-title">

                <GitCompare size={17} />

                Candidate Material

              </div>


              <div className="pending-detail-grid">

                <div>

                  <label>
                    Product ID
                  </label>

                  <strong>
                    {selectedItem.candidateMaterialCode}
                  </strong>

                </div>


                <div>

                  <label>
                    CPSE
                  </label>

                  <strong>
                    {selectedItem.candidateCPSE}
                  </strong>

                </div>


                <div className="full">

                  <label>
                    Material
                  </label>

                  <strong>
                    {selectedItem.candidateMaterial}
                  </strong>

                </div>


                <div className="full">

                  <label>
                    Technical Description
                  </label>

                  <p>
                    {selectedItem.candidateSpecification}
                  </p>

                </div>

              </div>

            </div>


            {/* =================================================
                MATCHING INFORMATION
            ================================================= */}

            <div className="pending-detail-section">

              <div className="pending-section-title">

                <Gauge size={17} />

                Matching Information

              </div>


              <div className="pending-match-grid">

                <div>

                  <label>
                    Splink Score
                  </label>

                  <strong>
                    {formatScore(
                      selectedItem.score
                    )}
                  </strong>

                </div>


                <div>

                  <label>
                    Match Weight
                  </label>

                  <strong>
                    {selectedItem.matchWeight.toFixed(
                      2
                    )}
                  </strong>

                </div>


                <div>

                  <label>
                    Status
                  </label>

                  <strong>
                    {selectedItem.status}
                  </strong>

                </div>


                <div>

                  <label>
                    UNSPSC
                  </label>

                  <strong>
                    {selectedItem.unspsc}
                  </strong>

                </div>

              </div>

            </div>


            {/* =================================================
                TECHNICAL DETAILS
            ================================================= */}

            <div className="pending-detail-section">

              <div className="pending-section-title">

                Technical Details

              </div>


              <div className="pending-technical">

                <div>

                  <label>
                    Source Technical Description
                  </label>

                  <p>
                    {selectedItem.technicalDescription ||
                      "Not available"}
                  </p>

                </div>


                <div>

                  <label>
                    Candidate Technical Description
                  </label>

                  <p>
                    {selectedItem.candidateTechnicalDescription ||
                      "Not available"}
                  </p>

                </div>

              </div>

            </div>


            {/* =================================================
                SIMILARITIES
            ================================================= */}

            <div className="pending-detail-section">

              <div className="pending-section-title">

                Matching Similarities

              </div>


              {selectedItem.similarities?.length > 0 ? (

                <div className="pending-comparison-list">

                  {selectedItem.similarities.map(
                    (similarity, index) => (

                      <div
                        className="pending-comparison-item similarity"
                        key={index}
                      >

                        <div className="pending-comparison-marker">
                          ✓
                        </div>

                        <p>
                          {similarity}
                        </p>

                      </div>

                    )
                  )}

                </div>

              ) : (

                <div className="pending-no-comparison">

                  No matching similarities identified.

                </div>

              )}

            </div>


            {/* =================================================
                DIFFERENCES
            ================================================= */}

            <div className="pending-detail-section">

              <div className="pending-section-title">

                Identified Differences

              </div>


              {selectedItem.differences?.length > 0 ? (

                <div className="pending-comparison-list">

                  {selectedItem.differences.map(
                    (difference, index) => (

                      <div
                        className="pending-comparison-item difference"
                        key={index}
                      >

                        <div className="pending-comparison-marker">
                          !
                        </div>

                        <p>
                          {difference}
                        </p>

                      </div>

                    )
                  )}

                </div>

              ) : (

                <div className="pending-no-comparison">

                  No significant differences identified.

                </div>

              )}

            </div>


            {/* =================================================
                HUMAN VALIDATION ACTIONS
            ================================================= */}

            <div className="pending-action-area">

              <div className="pending-action-info">

                <strong>
                  Human Validation Required
                </strong>

                <p>
                  Review the source and candidate
                  material details before confirming
                  the AI match.
                </p>

              </div>


              <div className="pending-action-buttons">

                {/* APPROVE */}

                <button
                  className="pending-action-button approve"
                  onClick={() =>
                    handleDecision("MATCH")
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
                  className="pending-action-button reject"
                  onClick={() =>
                    handleDecision("NOT A MATCH")
                  }
                  disabled={loading}
                >

                  <XCircle size={17} />

                  {loading
                    ? "Updating..."
                    : "Reject Match"}

                </button>

              </div>

            </div>


          </div>

        </div>

      )}

    </div>

  );

}


export default Pending;

