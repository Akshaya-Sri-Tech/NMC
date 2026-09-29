
import { useEffect, useMemo, useState } from "react";

import {
  Search,
  Package,
  Building2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  RefreshCw,
  IndianRupee,
} from "lucide-react";

import {
  getSampleMaterials,
  getHumanEvaluations,
} from "./api";


function SmartSubstitution() {

  /* =======================================================
     STATE
  ======================================================= */

  const [materials, setMaterials] = useState([]);

  const [evaluations, setEvaluations] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedMaterial, setSelectedMaterial] =
    useState(null);


  /* =======================================================
     LOAD DATA
     
     Sample materials:
     - material code
     - description
     - CPSE
     - specification
     - price

     Human evaluations:
     - source material
     - candidate material
     - Splink score
     - similarities
     - differences
  ======================================================= */

  const loadData = async () => {

    try {

      setLoading(true);

      setError("");

      const [
        materialResponse,
        evaluationResponse,
      ] = await Promise.all([
        getSampleMaterials(),
        getHumanEvaluations(),
      ]);


      setMaterials(
        materialResponse.materials || []
      );


      setEvaluations(
        evaluationResponse.evaluations ||
        evaluationResponse ||
        []
      );

    } catch (err) {

      console.error(
        "Smart substitution error:",
        err
      );

      setError(
        "Unable to load substitution data from backend."
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    loadData();

  }, []);


  /* =======================================================
     MATERIAL HELPERS
  ======================================================= */

  const getMaterialById = (id) => {

    return materials.find(
      (material) =>
        String(material.material_id) ===
        String(id)
    );

  };


  const getMaterialName = (material) => {

    if (!material) {

      return "Unknown material";

    }

    return (
      material.material_description ||
      material.description ||
      material.material_name ||
      "Unknown material"
    );

  };


  const getMaterialCode = (material) => {

    if (!material) {

      return "—";

    }

    return (
      material.material_code ||
      material.code ||
      "—"
    );

  };


  const getCPSE = (material) => {

    if (!material) {

      return "—";

    }

    return (
      material.cpse_name ||
      material.cpse_code ||
      material.cpse ||
      "—"
    );

  };


  const getSpecification = (material) => {

    if (!material) {

      return "—";

    }

    return (
      material.specification ||
      material.technical_description ||
      material.material_description ||
      "—"
    );

  };


  const getPrice = (material) => {

    if (!material) {

      return null;

    }

    const price =
      material.procurement_price_inr ??
      material.price ??
      material.unit_price;

    const numericPrice =
      Number(price);

    return Number.isFinite(numericPrice)
      ? numericPrice
      : null;

  };


  /* =======================================================
     BUILD SUBSTITUTION RELATIONSHIPS
     
     Human evaluation gives:
     
     left_product_id
                 ↕
     right_product_id

     We convert those IDs into actual sample-material
     records so the UI can display the material details.
  ======================================================= */

  const substitutionRecords = useMemo(() => {

    const records = [];

    evaluations.forEach((evaluation) => {

      const leftMaterial =
        getMaterialById(
          evaluation.left_product_id
        );

      const rightMaterial =
        getMaterialById(
          evaluation.right_product_id
        );


      if (!leftMaterial || !rightMaterial) {

        return;

      }


      const score =
        Number(
          evaluation.splink_score || 0
        );


      const decision =
        evaluation.prototype_decision ||
        "";


      let compatibility =
        "Incompatible";


      if (
        decision === "MATCH" &&
        score >= 0.99
      ) {

        compatibility =
          "Compatible";

      } else if (
        decision === "MATCH" &&
        score >= 0.90
      ) {

        compatibility =
          "Conditional";

      }


      records.push({

        source: leftMaterial,

        alternative: rightMaterial,

        sourceId:
          evaluation.left_product_id,

        alternativeId:
          evaluation.right_product_id,

        score,

        compatibility,

        prototypeDecision:
          decision,

        similarities:
          evaluation.similarities || [],

        differences:
          evaluation.differences || [],

        status:
          evaluation.status || "PENDING",

      });


      /*
        Also create the reverse relationship.

        This means:

        A → B

        also allows:

        B → A

        because the same two materials can be
        alternatives for each other.
      */

      records.push({

        source: rightMaterial,

        alternative: leftMaterial,

        sourceId:
          evaluation.right_product_id,

        alternativeId:
          evaluation.left_product_id,

        score,

        compatibility,

        prototypeDecision:
          decision,

        similarities:
          evaluation.similarities || [],

        differences:
          evaluation.differences || [],

        status:
          evaluation.status || "PENDING",

      });

    });


    return records;

  }, [evaluations, materials]);


  /* =======================================================
     AVAILABLE SOURCE MATERIALS
  ======================================================= */

  const sourceMaterials = useMemo(() => {

    const unique = new Map();


    substitutionRecords.forEach(
      (record) => {

        const material =
          record.source;


        if (!material) {

          return;

        }


        const id =
          material.material_id;


        if (!unique.has(id)) {

          unique.set(
            id,
            material
          );

        }

      }
    );


    return Array.from(
      unique.values()
    );

  }, [substitutionRecords]);


  /* =======================================================
     SEARCH MATERIALS
  ======================================================= */

  const searchedMaterials = useMemo(() => {

    const value =
      searchTerm
        .trim()
        .toLowerCase();


    if (!value) {

      return sourceMaterials;

    }


    return sourceMaterials.filter(
      (material) => {

        const code =
          String(
            getMaterialCode(material)
          ).toLowerCase();


        const name =
          String(
            getMaterialName(material)
          ).toLowerCase();


        const cpse =
          String(
            getCPSE(material)
          ).toLowerCase();


        return (
          code.includes(value) ||
          name.includes(value) ||
          cpse.includes(value)
        );

      }
    );

  }, [
    searchTerm,
    sourceMaterials,
  ]);


  /* =======================================================
     SELECTED MATERIAL
  ======================================================= */

  const selectedAlternatives = useMemo(() => {

    if (!selectedMaterial) {

      return [];

    }


    const selectedId =
      selectedMaterial.material_id;


    return substitutionRecords
      .filter(
        (record) =>
          String(
            record.sourceId
          ) ===
          String(selectedId)
      )
      .filter(
        (record) =>
          String(
            record.alternativeId
          ) !==
          String(selectedId)
      )
      .sort(
        (a, b) => {

          const priceA =
            getPrice(a.alternative);

          const priceB =
            getPrice(b.alternative);


          /*
            Materials with a known price are shown
            first, sorted from lowest to highest.

            Unknown prices are placed at the bottom.
          */

          if (
            priceA === null &&
            priceB === null
          ) {

            return 0;

          }


          if (priceA === null) {

            return 1;

          }


          if (priceB === null) {

            return -1;

          }


          return priceA - priceB;

        }
      );

  }, [
    selectedMaterial,
    substitutionRecords,
  ]);


  /* =======================================================
     FORMAT PRICE
  ======================================================= */

  const formatPrice = (material) => {

    const price =
      getPrice(material);


    if (price === null) {

      return "Not available";

    }


    return `₹${price.toLocaleString(
      "en-IN"
    )}`;

  };


  /* =======================================================
     COMPATIBILITY ICON
  ======================================================= */

  const CompatibilityIcon = ({
    compatibility,
  }) => {

    if (
      compatibility ===
      "Compatible"
    ) {

      return (
        <CheckCircle2
          size={15}
        />
      );

    }


    if (
      compatibility ===
      "Conditional"
    ) {

      return (
        <AlertTriangle
          size={15}
        />
      );

    }


    return (
      <XCircle
        size={15}
      />
    );

  };


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {

    return (

      <div className="smart-substitution-page">

        <div className="smart-initial-state">

          <RefreshCw
            size={30}
            className="smart-loading-icon"
          />

          <h3>
            Loading substitution data...
          </h3>

          <p>
            Fetching material relationships
            and procurement information.
          </p>

        </div>

      </div>

    );

  }


  /* =======================================================
     RENDER
  ======================================================= */

  return (

    <div className="smart-substitution-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="smart-page-header">

        <div>

          <div className="smart-eyebrow">
            MATERIAL INTELLIGENCE
          </div>

          <h2>
            Smart Substitution
          </h2>

          <p>
            Find compatible material alternatives
            across CPSEs using AI-identified
            material relationships.
          </p>

        </div>

      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (

        <div className="smart-error">

          <AlertTriangle
            size={20}
          />

          <span>
            {error}
          </span>

        </div>

      )}


      {/* =================================================
          SEARCH PANEL
      ================================================= */}

      <section className="smart-search-panel">

        <div className="smart-panel-heading">

          <Package
            size={18}
          />

          <div>

            <h3>
              Find a Material
            </h3>

            <span>
              Search by material code,
              material name or CPSE.
            </span>

          </div>

        </div>


        <div className="smart-search-row">

          <div className="smart-search-input">

            <Search
              size={18}
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
              placeholder="Search material code, name or CPSE..."
            />

          </div>

        </div>


        {/* SOURCE MATERIAL RESULTS */}

        {searchTerm.trim() && (

          <div className="smart-search-results">

            {searchedMaterials.length > 0 ? (

              searchedMaterials.map(
                (material) => (

                  <button
                    key={
                      material.material_id
                    }
                    className={
                      `smart-search-result ${
                        selectedMaterial?.material_id ===
                        material.material_id
                          ? "selected"
                          : ""
                      }`
                    }
                    onClick={() =>
                      setSelectedMaterial(
                        material
                      )
                    }
                  >

                    <div>

                      <strong>
                        {getMaterialCode(
                          material
                        )}
                      </strong>

                      <span>
                        {getMaterialName(
                          material
                        )}
                      </span>

                    </div>

                    <span className="smart-result-cpse">

                      <Building2
                        size={14}
                      />

                      {getCPSE(
                        material
                      )}

                    </span>

                  </button>

                )
              )

            ) : (

              <div className="smart-no-results">

                <Package
                  size={22}
                />

                <span>
                  No matching materials found.
                </span>

              </div>

            )}

          </div>

        )}

      </section>


      {/* =================================================
          SELECTED MATERIAL
      ================================================= */}

      {selectedMaterial && (

        <section className="smart-selected-panel">


          <div className="smart-selected-header">

            <div>

              <div className="smart-selected-eyebrow">
                SOURCE MATERIAL
              </div>

              <h3>
                {getMaterialName(
                  selectedMaterial
                )}
              </h3>

              <span>
                {getMaterialCode(
                  selectedMaterial
                )}
              </span>

            </div>


            <div className="smart-selected-cpse">

              <Building2
                size={16}
              />

              {getCPSE(
                selectedMaterial
              )}

            </div>

          </div>


          <div className="smart-selected-spec">

            <span>
              SPECIFICATION
            </span>

            <p>
              {getSpecification(
                selectedMaterial
              )}
            </p>

          </div>


        </section>

      )}


      {/* =================================================
          ALTERNATIVES
      ================================================= */}

      {selectedMaterial && (

        <section className="smart-alternatives-section">


          <div className="smart-alternatives-header">

            <div>

              <div className="smart-alternatives-eyebrow">
                AI-IDENTIFIED OPTIONS
              </div>

              <h3>
                Available Substitutions
              </h3>

              <span>
                {selectedAlternatives.length}
                {" "}
                alternative
                {selectedAlternatives.length === 1
                  ? ""
                  : "s"}
                {" "}
                found across CPSEs
              </span>

            </div>


            <div className="smart-sort-label">

              <IndianRupee
                size={15}
              />

              Lowest price first

            </div>

          </div>


          {selectedAlternatives.length > 0 ? (

            <div className="smart-alternatives-table-wrap">

              <table className="smart-alternatives-table">

                <thead>

                  <tr>

                    <th>
                      MATERIAL CODE
                    </th>

                    <th>
                      MATERIAL
                    </th>

                    <th>
                      CPSE
                    </th>

                    <th>
                      SPECIFICATION
                    </th>

                    <th>
                      AVAILABILITY
                    </th>

                    <th>
                      COMPATIBILITY
                    </th>

                    <th>
                      PRICE
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {selectedAlternatives.map(
                    (record, index) => {

                      const alternative =
                        record.alternative;


                      const price =
                        getPrice(
                          alternative
                        );


                      return (

                        <tr
                          key={`${record.alternativeId}-${index}`}
                        >

                          {/* MATERIAL CODE */}

                          <td>

                            <span className="smart-material-code">

                              {getMaterialCode(
                                alternative
                              )}

                            </span>

                          </td>


                          {/* MATERIAL */}

                          <td>

                            <div className="smart-material-name">

                              <Package
                                size={16}
                              />

                              <strong>
                                {getMaterialName(
                                  alternative
                                )}
                              </strong>

                            </div>

                          </td>


                          {/* CPSE */}

                          <td>

                            <span className="smart-cpse">

                              <Building2
                                size={14}
                              />

                              {getCPSE(
                                alternative
                              )}

                            </span>

                          </td>


                          {/* SPECIFICATION */}

                          <td>

                            <span className="smart-specification">

                              {getSpecification(
                                alternative
                              )}

                            </span>

                          </td>


                          {/* AVAILABILITY */}

                          <td>

                            <span className="smart-availability">

                              <CheckCircle2
                                size={15}
                              />

                              Available

                            </span>

                          </td>


                          {/* COMPATIBILITY */}

                          <td>

                            <span
                              className={
                                `smart-compatibility ${
                                  record.compatibility
                                    .toLowerCase()
                                    .replace(
                                      " ",
                                      "-"
                                    )
                                }`
                              }
                            >

                              <CompatibilityIcon
                                compatibility={
                                  record.compatibility
                                }
                              />

                              {record.compatibility}

                            </span>

                          </td>


                          {/* PRICE */}

                          <td>

                            <span
                              className={
                                `smart-price ${
                                  price === null
                                    ? "unknown"
                                    : ""
                                }`
                              }
                            >

                              {formatPrice(
                                alternative
                              )}

                            </span>

                          </td>

                        </tr>

                      );

                    }
                  )}

                </tbody>

              </table>

            </div>

          ) : (

            <div className="smart-empty-state">

              <AlertTriangle
                size={28}
              />

              <h3>
                No substitutions found
              </h3>

              <p>
                No evaluated alternative materials
                are currently available for this
                material.
              </p>

            </div>

          )}

        </section>

      )}


      {/* =================================================
          INITIAL STATE
      ================================================= */}

      {!selectedMaterial && (

        <div className="smart-initial-state">

          <ArrowRight
            size={30}
          />

          <h3>
            Select a Material
          </h3>

          <p>
            Search for a material above to view
            compatible alternatives across CPSEs.
          </p>

        </div>

      )}

    </div>

  );

}


export default SmartSubstitution;

