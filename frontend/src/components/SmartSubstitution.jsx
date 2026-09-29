
import { useEffect, useMemo, useState } from "react";

import {
  Search,
  Filter,
  RotateCcw,
  Package,
  Building2,
  CheckCircle2,
  AlertTriangle,
  X,
  ArrowRightLeft,
  CircleDot,
} from "lucide-react";

import {
  getSampleMaterials,
  standardizeMaterials,
} from "./api";


/* =========================================================
   COMPONENT
========================================================= */

function SmartSubstitution() {

  const [substitutionData, setSubstitutionData] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  const [search, setSearch] =
    useState("");

  const [searchedValue, setSearchedValue] =
    useState("");

  const [cpseFilter, setCpseFilter] =
    useState("All CPSEs");

  const [materialFilter, setMaterialFilter] =
    useState("All Materials");

  const [availabilityFilter, setAvailabilityFilter] =
    useState("All");

  const [compatibilityFilter, setCompatibilityFilter] =
    useState("All");

  const [selectedMaterial, setSelectedMaterial] =
    useState(null);


  /* =========================================================
     LOAD BACKEND + RUN STANDARDIZATION
  ========================================================= */

  useEffect(() => {

    async function loadSubstitutionData() {

      try {

        setLoading(true);
        setError("");


        /* -----------------------------------------------
           1. Get raw material records
        ------------------------------------------------ */

        const materialResponse =
          await getSampleMaterials();

        const materials =
          materialResponse.materials || [];


        if (!materials.length) {

          setSubstitutionData([]);
          setLoading(false);

          return;

        }


        /* -----------------------------------------------
           2. Send materials to AI/ML backend
        ------------------------------------------------ */

        const standardizeResponse =
          await standardizeMaterials(
            materials
          );
          console.log(
  "STANDARDIZE RESPONSE:",
  standardizeResponse
);

        const results =
          standardizeResponse.results || [];


        /* -----------------------------------------------
           3. Convert backend matching results
              into substitution records
        ------------------------------------------------ */

        const formattedResults =
          results.map((item, index) => {

            const leftId =
              item.left_product_id;

            const rightId =
              item.right_product_id;


            const leftMaterial =
              materials.find(
                (material) =>
                  material.material_id ===
                  leftId
              );


            const rightMaterial =
              materials.find(
                (material) =>
                  material.material_id ===
                  rightId
              );


            /*
              Use the right-side material as the
              possible substitution option.
            */

            const source =
              leftMaterial || {};

            const alternative =
              rightMaterial || {};


            const score =
              Number(
                item.splink_score
              ) || 0;


            /* -----------------------------------------
               Compatibility presentation

               MATCH with very high score
               → Compatible

               MATCH with lower score
               → Conditional

               NEW_NMC_CODE
               → Incompatible
            ----------------------------------------- */

            let compatibility =
              "Incompatible";


            if (
              item.prototype_decision ===
              "MATCH"
            ) {

              if (score >= 0.99) {

                compatibility =
                  "Compatible";

              } else {

                compatibility =
                  "Conditional";

              }

            }


            /*
              The backend currently does not contain
              an availability field.

              We therefore mark records as Available
              when they exist in the backend dataset.
            */

            const availability =
              alternative.material_id
                ? "Available"
                : "Limited";


            return {

              id:
                `${leftId}-${rightId}-${index}`,

              materialCode:
                alternative.material_code ||
                alternative.material_id ||
                "—",

              sourceMaterialCode:
                source.material_code ||
                source.material_id ||
                "—",

              material:
                alternative.material_description ||
                item.right_product_type ||
                "Unknown Material",

              sourceMaterial:
                source.material_description ||
                item.left_product_type ||
                "Unknown Material",

              cpse:
                alternative.cpse_code ||
                item.right_cpse ||
                "—",

              cpseName:
                alternative.cpse_name ||
                item.right_cpse ||
                "—",

              specification:
                alternative.specification ||
                alternative.material_description ||
                item.right_technical_desc ||
                "—",

              technicalDescription:
                item.right_technical_desc ||
                alternative.specification ||
                "—",

              category:
                alternative.category ||
                alternative.material_group ||
                "—",

              price:
                Number(
                  alternative.procurement_price_inr
                ) || 0,

              availability,

              compatibility,

              score,

              decision:
                item.prototype_decision ||
                "—",

              sourceId:
                leftId,

              alternativeId:
                rightId,

            };

          });


        /*
          Remove self-matches where both sides
          refer to the same material.
        */

        const cleanedResults =
          formattedResults.filter(
            (item) =>
              item.sourceId !==
              item.alternativeId
          );


        setSubstitutionData(
          cleanedResults
        );

        setLoading(false);

      }

      catch (err) {

        console.error(
          "Smart substitution backend error:",
          err
        );

        setError(
          "Unable to load substitution results from backend."
        );

        setLoading(false);

      }

    }


    loadSubstitutionData();

  }, []);


  /* =========================================================
     SEARCH
  ========================================================= */

  const handleSearch = () => {

    const value =
      search.trim();

    setSearchedValue(value);

    setCpseFilter("All CPSEs");
    setMaterialFilter("All Materials");
    setAvailabilityFilter("All");
    setCompatibilityFilter("All");

  };


  const handleKeyDown = (event) => {

    if (event.key === "Enter") {

      handleSearch();

    }

  };


  /* =========================================================
     SEARCH RESULTS
  ========================================================= */

  const searchedData = useMemo(() => {

    if (!searchedValue) {

      return [];

    }


    const searchLower =
      searchedValue.toLowerCase();


    return substitutionData.filter(
      (item) =>

        item.materialCode
          .toLowerCase()
          .includes(searchLower) ||

        item.material
          .toLowerCase()
          .includes(searchLower) ||

        item.sourceMaterial
          .toLowerCase()
          .includes(searchLower) ||

        item.cpse
          .toLowerCase()
          .includes(searchLower) ||

        item.cpseName
          .toLowerCase()
          .includes(searchLower)

    );

  }, [
    searchedValue,
    substitutionData,
  ]);


  /* =========================================================
     FILTER OPTIONS
  ========================================================= */

  const availableCPSEs = useMemo(() => {

    return [
      ...new Set(
        searchedData.map(
          (item) => item.cpse
        )
      ),
    ];

  }, [searchedData]);


  const availableMaterials = useMemo(() => {

    return [
      ...new Set(
        searchedData.map(
          (item) => item.material
        )
      ),
    ];

  }, [searchedData]);


  /* =========================================================
     FILTERED RESULTS
  ========================================================= */

  const filteredData = useMemo(() => {

    return searchedData

      .filter((item) => {

        const cpseMatch =
          cpseFilter === "All CPSEs" ||
          item.cpse === cpseFilter;


        const materialMatch =
          materialFilter === "All Materials" ||
          item.material === materialFilter;


        const availabilityMatch =
          availabilityFilter === "All" ||
          item.availability ===
            availabilityFilter;


        const compatibilityMatch =
          compatibilityFilter === "All" ||
          item.compatibility ===
            compatibilityFilter;


        return (
          cpseMatch &&
          materialMatch &&
          availabilityMatch &&
          compatibilityMatch
        );

      })

      .sort(
        (a, b) =>
          a.price - b.price
      );

  }, [
    searchedData,
    cpseFilter,
    materialFilter,
    availabilityFilter,
    compatibilityFilter,
  ]);


  /* =========================================================
     SUMMARY
  ========================================================= */

  const availableCount =
    filteredData.filter(
      (item) =>
        item.availability ===
        "Available"
    ).length;


  const compatibleCount =
    filteredData.filter(
      (item) =>
        item.compatibility ===
        "Compatible"
    ).length;


  const cpseCount =
    new Set(
      filteredData.map(
        (item) => item.cpse
      )
    ).size;


  /* =========================================================
     CLEAR FILTERS
  ========================================================= */

  const clearFilters = () => {

    setCpseFilter("All CPSEs");
    setMaterialFilter("All Materials");
    setAvailabilityFilter("All");
    setCompatibilityFilter("All");

  };


  /* =========================================================
     PRICE FORMAT
  ========================================================= */

  const formatPrice = (price) => {

    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    ).format(price);

  };


  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {

    return (

      <div className="smart-substitution-page">

        <div className="substitution-page-header">

          <div>

            <div className="substitution-eyebrow">
              PROCUREMENT OPTIMIZATION
            </div>

            <h2>
              Smart Substitution Across CPSE
            </h2>

            <p>
              Running material harmonization
              and substitution analysis...
            </p>

          </div>

        </div>

      </div>

    );

  }


  /* =========================================================
     ERROR
  ========================================================= */

  if (error) {

    return (

      <div className="smart-substitution-page">

        <div className="substitution-page-header">

          <div>

            <div className="substitution-eyebrow">
              PROCUREMENT OPTIMIZATION
            </div>

            <h2>
              Smart Substitution Across CPSE
            </h2>

            <p>
              {error}
            </p>

          </div>

        </div>

      </div>

    );

  }


  /* =========================================================
     RENDER
  ========================================================= */

  return (

    <div className="smart-substitution-page">


      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="substitution-page-header">

        <div>

          <div className="substitution-eyebrow">
            PROCUREMENT OPTIMIZATION
          </div>

          <h2>
            Smart Substitution Across CPSE
          </h2>

          <p>
            Identify compatible material
            alternatives available across
            Central Public Sector Enterprises.
          </p>

        </div>

      </div>


      {/* =================================================
          SEARCH PANEL
      ================================================= */}

      <section className="substitution-search-panel">

        <div className="substitution-panel-title">

          <ArrowRightLeft size={18} />

          <div>

            <h3>
              Find Material Alternatives
            </h3>

            <span>
              Search using a material code,
              material name or CPSE.
            </span>

          </div>

        </div>


        <div className="substitution-search-row">

          <div className="substitution-search-input">

            <Search size={17} />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              onKeyDown={handleKeyDown}
              placeholder="Enter material code, material name or CPSE..."
            />

          </div>


          <button
            className="substitution-search-button"
            onClick={handleSearch}
          >
            <Search size={15} />
            Search
          </button>

        </div>

      </section>


      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      {searchedValue && (

        <div className="substitution-summary-grid">

          <div className="substitution-summary-card">

            <div className="substitution-summary-icon">
              <Package size={18} />
            </div>

            <div>

              <span>
                ALTERNATIVES
              </span>

              <strong>
                {filteredData.length}
              </strong>

            </div>

          </div>


          <div className="substitution-summary-card">

            <div className="substitution-summary-icon">
              <Building2 size={18} />
            </div>

            <div>

              <span>
                CPSEs
              </span>

              <strong>
                {cpseCount}
              </strong>

            </div>

          </div>


          <div className="substitution-summary-card">

            <div className="substitution-summary-icon">
              <CheckCircle2 size={18} />
            </div>

            <div>

              <span>
                COMPATIBLE
              </span>

              <strong>
                {compatibleCount}
              </strong>

            </div>

          </div>


          <div className="substitution-summary-card">

            <div className="substitution-summary-icon">
              <CircleDot size={18} />
            </div>

            <div>

              <span>
                AVAILABLE
              </span>

              <strong>
                {availableCount}
              </strong>

            </div>

          </div>

        </div>

      )}


      {/* =================================================
          RESULTS
      ================================================= */}

      <section className="substitution-results-section">


        <div className="substitution-results-header">

          <div>

            <div className="substitution-result-label">
              MATERIAL SUBSTITUTION
            </div>

            <h3>
              Compatible Alternatives
            </h3>

            <span>
              Results are ordered from
              lowest to highest price.
            </span>

          </div>

        </div>


        {/* =================================================
            FILTER BAR
        ================================================= */}

        {searchedValue &&
          searchedData.length > 0 && (

            <div className="substitution-filter-bar">


              <div className="substitution-filter-label">

                <Filter size={15} />

                <span>
                  Filter Results
                </span>

              </div>


              {/* CPSE */}

              <div className="substitution-filter-control">

                <Building2 size={14} />

                <select
                  value={cpseFilter}
                  onChange={(event) =>
                    setCpseFilter(
                      event.target.value
                    )
                  }
                >

                  <option>
                    All CPSEs
                  </option>

                  {availableCPSEs.map(
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

              </div>


              {/* MATERIAL */}

              <div className="substitution-filter-control">

                <Package size={14} />

                <select
                  value={materialFilter}
                  onChange={(event) =>
                    setMaterialFilter(
                      event.target.value
                    )
                  }
                >

                  <option>
                    All Materials
                  </option>

                  {availableMaterials.map(
                    (material) => (

                      <option
                        key={material}
                        value={material}
                      >
                        {material}
                      </option>

                    )
                  )}

                </select>

              </div>


              {/* AVAILABILITY */}

              <div className="substitution-filter-control">

                <CircleDot size={14} />

                <select
                  value={availabilityFilter}
                  onChange={(event) =>
                    setAvailabilityFilter(
                      event.target.value
                    )
                  }
                >

                  <option value="All">
                    All Availability
                  </option>

                  <option value="Available">
                    Available
                  </option>

                  <option value="Limited">
                    Limited
                  </option>

                </select>

              </div>


              {/* COMPATIBILITY */}

              <div className="substitution-filter-control">

                <CheckCircle2 size={14} />

                <select
                  value={compatibilityFilter}
                  onChange={(event) =>
                    setCompatibilityFilter(
                      event.target.value
                    )
                  }
                >

                  <option value="All">
                    All Compatibility
                  </option>

                  <option value="Compatible">
                    Compatible
                  </option>

                  <option value="Conditional">
                    Conditional
                  </option>

                  <option value="Incompatible">
                    Incompatible
                  </option>

                </select>

              </div>


              <button
                className="substitution-clear-button"
                onClick={clearFilters}
              >

                <RotateCcw size={14} />

                Clear Filters

              </button>

            </div>

          )}


        {/* =================================================
            TABLE
        ================================================= */}

        {searchedValue &&
        filteredData.length > 0 ? (

          <div className="substitution-table-container">

            <table className="substitution-table">

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

                {filteredData.map(
                  (item, index) => (

                    <tr
                      key={`${item.id}-${index}`}
                      onClick={() =>
                        setSelectedMaterial(
                          item
                        )
                      }
                    >


                      <td>

                        <span className="substitution-nmc-code">

                          {item.materialCode}

                        </span>

                      </td>


                      <td>

                        <div className="substitution-material">

                          <Package size={15} />

                          <strong>
                            {item.material}
                          </strong>

                        </div>

                      </td>


                      <td>

                        <span className="substitution-cpse">

                          {item.cpse}

                        </span>

                      </td>


                      <td>

                        <span className="substitution-specification">

                          {item.specification}

                        </span>

                      </td>


                      <td>

                        {item.availability ===
                        "Available" ? (

                          <span className="substitution-availability available">

                            <CheckCircle2 size={12} />

                            Available

                          </span>

                        ) : (

                          <span className="substitution-availability limited">

                            <AlertTriangle size={12} />

                            Limited

                          </span>

                        )}

                      </td>


                      <td>

                        <span
                          className={`substitution-compatibility ${
                            item.compatibility ===
                            "Compatible"
                              ? "compatible"
                              : item.compatibility ===
                                "Conditional"
                              ? "conditional"
                              : "incompatible"
                          }`}
                        >

                          {item.compatibility}

                        </span>

                      </td>


                      <td>

                        <strong className="substitution-price">

                          {formatPrice(
                            item.price
                          )}

                        </strong>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        ) : searchedValue ? (

          <div className="substitution-empty-state">

            <AlertTriangle size={30} />

            <h3>
              No compatible alternatives found
            </h3>

            <p>
              Try another material code,
              material name or filter
              combination.
            </p>

          </div>

        ) : (

          <div className="substitution-initial-state">

            <ArrowRightLeft size={34} />

            <h3>
              Search for a material
            </h3>

            <p>
              Enter a material code or
              material name above to view
              alternatives across CPSEs.
            </p>

          </div>

        )}

      </section>


      {/* =================================================
          DETAIL PANEL
      ================================================= */}

      {selectedMaterial && (

        <div className="substitution-detail-overlay">

          <div className="substitution-detail-panel">


            <div className="substitution-detail-header">

              <div>

                <span>
                  SUBSTITUTION RECORD
                </span>

                <h3>
                  {selectedMaterial.material}
                </h3>

              </div>


              <button
                onClick={() =>
                  setSelectedMaterial(null)
                }
              >

                <X size={18} />

              </button>

            </div>


            <div className="substitution-detail-code">

              {selectedMaterial.materialCode}

            </div>


            <div className="substitution-detail-grid">


              <div>

                <span>
                  SOURCE MATERIAL
                </span>

                <strong>
                  {selectedMaterial.sourceMaterial}
                </strong>

              </div>


              <div>

                <span>
                  CPSE
                </span>

                <strong>
                  {selectedMaterial.cpse}
                </strong>

              </div>


              <div>

                <span>
                  CATEGORY
                </span>

                <strong>
                  {selectedMaterial.category}
                </strong>

              </div>


              <div>

                <span>
                  SPECIFICATION
                </span>

                <strong>
                  {selectedMaterial.specification}
                </strong>

              </div>


              <div>

                <span>
                  PRICE
                </span>

                <strong>
                  {formatPrice(
                    selectedMaterial.price
                  )}
                </strong>

              </div>


              <div>

                <span>
                  MATCH SCORE
                </span>

                <strong>
                  {(
                    selectedMaterial.score *
                    100
                  ).toFixed(2)}
                  %
                </strong>

              </div>

            </div>


            <div
              className={`substitution-detail-status ${
                selectedMaterial.compatibility ===
                "Compatible"
                  ? "compatible"
                  : selectedMaterial.compatibility ===
                    "Conditional"
                  ? "conditional"
                  : "incompatible"
              }`}
            >

              {selectedMaterial.compatibility ===
              "Compatible" ? (

                <CheckCircle2 size={18} />

              ) : (

                <AlertTriangle size={18} />

              )}


              <div>

                <strong>

                  {selectedMaterial.compatibility ===
                  "Compatible"
                    ? "Compatible Material"
                    : selectedMaterial.compatibility ===
                      "Conditional"
                    ? "Conditional Compatibility"
                    : "Incompatible Material"}

                </strong>


                <span>

                  Backend decision:{" "}

                  {selectedMaterial.decision}

                  {" "}with a Splink score of{" "}

                  {(
                    selectedMaterial.score *
                    100
                  ).toFixed(2)}

                  %.

                </span>

              </div>

            </div>


            <div
              className={
                selectedMaterial.availability ===
                "Available"
                  ? "substitution-detail-availability available"
                  : "substitution-detail-availability limited"
              }
            >

              {selectedMaterial.availability ===
              "Available" ? (

                <CheckCircle2 size={17} />

              ) : (

                <AlertTriangle size={17} />

              )}


              <div>

                <strong>
                  {selectedMaterial.availability}
                </strong>

                <span>
                  Material record is available
                  in the backend dataset from{" "}
                  {selectedMaterial.cpse}.
                </span>

              </div>

            </div>


            <button
              className="substitution-close-button"
              onClick={() =>
                setSelectedMaterial(null)
              }
            >
              Close
            </button>

          </div>

        </div>

      )}

    </div>

  );

}


export default SmartSubstitution;

