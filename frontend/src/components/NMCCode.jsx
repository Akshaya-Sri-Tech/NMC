
import { useEffect, useMemo, useState } from "react";

import {
  Search,
  Filter,
  RotateCcw,
  Package,
  Building2,
  Hash,
  ChevronDown,
  AlertCircle,
} from "lucide-react";

import { getSampleMaterials } from "./api";


/* =========================================================
   FRONTEND NMC CODE GENERATOR

   Temporary frontend fallback for Step 8.

   This generates a deterministic NMC-style code from
   the material category and its position in the dataset.

   Example:
   Fasteners → NMC-FST-0001
   Valves    → NMC-VLV-0002
   Pipes     → NMC-PIP-0003

   This is NOT the actual Step 8 common_material_code.
   ========================================================= */

function getCategoryPrefix(category, description) {

  const text =
    `${category || ""} ${description || ""}`
      .toUpperCase();

  if (
    text.includes("BOLT") ||
    text.includes("NUT") ||
    text.includes("FASTENER") ||
    text.includes("SCREW")
  ) {
    return "BLT";
  }

  if (
    text.includes("VALVE")
  ) {
    return "VLV";
  }

  if (
    text.includes("PIPE") ||
    text.includes("TUBE")
  ) {
    return "PIP";
  }

  if (
    text.includes("BEARING")
  ) {
    return "BRG";
  }

  if (
    text.includes("CABLE") ||
    text.includes("WIRE")
  ) {
    return "CBL";
  }

  if (
    text.includes("PUMP")
  ) {
    return "PMP";
  }

  if (
    text.includes("MOTOR")
  ) {
    return "MTR";
  }

  if (
    text.includes("FILTER")
  ) {
    return "FLT";
  }

  if (
    text.includes("GASKET")
  ) {
    return "GSK";
  }

  if (
    text.includes("OIL") ||
    text.includes("LUBRICANT")
  ) {
    return "LUB";
  }

  if (
    text.includes("INSTRUMENT")
  ) {
    return "INS";
  }

  return "MAT";
}


function NMCCode() {

  /* =======================================================
     BACKEND DATA
  ======================================================= */

  const [nmcMaterials, setNmcMaterials] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {

    const loadMaterials = async () => {

      try {

        setLoading(true);

        setError("");

        const data =
          await getSampleMaterials();

        setNmcMaterials(
          data.materials || []
        );

      } catch (err) {

        console.error(
          "Backend error:",
          err
        );

        setError(
          "Unable to load material data from backend."
        );

      } finally {

        setLoading(false);

      }

    };

    loadMaterials();

  }, []);


  /* =======================================================
     ADD FRONTEND NMC CODES
  ======================================================= */

  const materialsWithNMC = useMemo(() => {

    /*
      Sort by material_id so that the generated number
      remains consistent for the same dataset.
    */

    const sortedMaterials =
      [...nmcMaterials].sort(
        (a, b) =>
          String(a.material_id || "")
            .localeCompare(
              String(b.material_id || "")
            )
      );

    return sortedMaterials.map(
      (item, index) => {

        const prefix =
          getCategoryPrefix(
            item.category,
            item.material_description
          );

        const number =
          String(index + 1)
            .padStart(4, "0");

        return {
          ...item,

          nmc_code:
            `NMC-${prefix}-${number}`,
        };

      }
    );

  }, [nmcMaterials]);


  /* =======================================================
     STATE
  ======================================================= */

  const [nmcSearch, setNmcSearch] =
    useState("");

  const [searchedCode, setSearchedCode] =
    useState("");

  const [cpseFilter, setCpseFilter] =
    useState("All CPSEs");

  const [materialFilter, setMaterialFilter] =
    useState("All Materials");


  /* =======================================================
     SEARCH
     ======================================================= */

  const handleSearch = () => {

    const value =
      nmcSearch.trim().toUpperCase();

    if (!value) {

      setSearchedCode("");

      return;

    }

    setSearchedCode(value);

    setCpseFilter("All CPSEs");

    setMaterialFilter("All Materials");

  };


  /* =======================================================
     ENTER KEY SEARCH
     ======================================================= */

  const handleKeyDown = (event) => {

    if (event.key === "Enter") {

      handleSearch();

    }

  };


  /* =======================================================
     FILTER OPTIONS
     ======================================================= */

  const availableMaterials =
    useMemo(() => {

      if (!searchedCode) {

        return [];

      }

      const results =
        materialsWithNMC.filter(
          (item) =>
            String(
              item.nmc_code || ""
            ).toUpperCase() ===
              searchedCode ||
            String(
              item.material_code || ""
            ).toUpperCase() ===
              searchedCode
        );

      return [
        ...new Set(
          results.map(
            (item) =>
              item.material_description
          )
        ),
      ];

    }, [
      searchedCode,
      materialsWithNMC,
    ]);


  const availableCPSEs =
    useMemo(() => {

      if (!searchedCode) {

        return [];

      }

      const results =
        materialsWithNMC.filter(
          (item) =>
            String(
              item.nmc_code || ""
            ).toUpperCase() ===
              searchedCode ||
            String(
              item.material_code || ""
            ).toUpperCase() ===
              searchedCode
        );

      return [
        ...new Set(
          results.map(
            (item) =>
              item.cpse_name
          )
        ),
      ];

    }, [
      searchedCode,
      materialsWithNMC,
    ]);


  /* =======================================================
     FILTER RESULTS
     ======================================================= */

  const filteredMaterials =
    useMemo(() => {

      if (!searchedCode) {

        return [];

      }

      return materialsWithNMC.filter(
        (item) => {

          const searchValue =
            searchedCode;

          const nmcMatch =
            String(
              item.nmc_code || ""
            ).toUpperCase() ===
              searchValue;

          const materialCodeMatch =
            String(
              item.material_code || ""
            ).toUpperCase() ===
              searchValue;

          const cpseMatch =
            cpseFilter ===
              "All CPSEs" ||
            item.cpse_name ===
              cpseFilter;

          const materialMatch =
            materialFilter ===
              "All Materials" ||
            item.material_description ===
              materialFilter;

          return (
            (nmcMatch ||
              materialCodeMatch) &&
            cpseMatch &&
            materialMatch
          );

        }
      );

    }, [
      searchedCode,
      cpseFilter,
      materialFilter,
      materialsWithNMC,
    ]);


  /* =======================================================
     CLEAR FILTERS
     ======================================================= */

  const clearFilters = () => {

    setCpseFilter(
      "All CPSEs"
    );

    setMaterialFilter(
      "All Materials"
    );

  };


  /* =======================================================
     LOADING STATE
     ======================================================= */

  if (loading) {

    return (

      <div className="nmc-page">

        <div className="nmc-initial-state">

          <Package size={32} />

          <h3>
            Loading material data...
          </h3>

          <p>
            Fetching standardized material
            information from the backend.
          </p>

        </div>

      </div>

    );

  }


  /* =======================================================
     RENDER
  ======================================================= */

  return (

    <div className="nmc-page">


      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="nmc-page-header">

        <div>

          <div className="nmc-eyebrow">
            MATERIAL STANDARDIZATION
          </div>

          <h2>
            NMC Code
          </h2>

          <p>
            Search a standardized material code
            and view associated materials across CPSEs.
          </p>

        </div>

      </div>


      {/* =================================================
          BACKEND ERROR
      ================================================= */}

      {error && (

        <div className="nmc-empty-state">

          <AlertCircle size={30} />

          <h3>
            Backend connection failed
          </h3>

          <p>
            {error}
          </p>

        </div>

      )}


      {/* =================================================
          SEARCH PANEL
      ================================================= */}

      <section className="nmc-search-panel">

        <div className="nmc-panel-header">

          <div className="nmc-panel-title">

            <Hash size={18} />

            <div>

              <h3>
                Search NMC Code
              </h3>

              <span>
                Enter an NMC code to view
                the associated material record.
              </span>

            </div>

          </div>

        </div>


        <div className="nmc-search-row">

          <div className="nmc-search-input">

            <Search size={18} />

            <input
              type="text"
              value={nmcSearch}
              onChange={(event) =>
                setNmcSearch(
                  event.target.value
                )
              }
              onKeyDown={handleKeyDown}
              placeholder="Enter NMC code e.g. NMC-BLT-0001"
            />

          </div>


          <button
            className="nmc-search-button"
            onClick={handleSearch}
          >

            <Search size={16} />

            Search

          </button>

        </div>

      </section>


      {/* =================================================
          RESULTS
      ================================================= */}

      {searchedCode && (

        <section className="nmc-results-section">


          {/* =============================================
              RESULT HEADER
          ============================================= */}

          <div className="nmc-results-header">

            <div>

              <div className="nmc-result-label">
                NMC CODE
              </div>

              <h3>
                {searchedCode}
              </h3>

              <span>
                Material records associated with
                this standardized code
              </span>

            </div>


            <div className="nmc-result-count">

              <Package size={17} />

              <strong>
                {filteredMaterials.length}
              </strong>

              <span>
                {filteredMaterials.length === 1
                  ? "material"
                  : "materials"}
              </span>

            </div>

          </div>


          {/* =============================================
              FILTER BAR
          ============================================= */}

          <div className="nmc-filter-bar">

            <div className="nmc-filter-label">

              <Filter size={16} />

              <span>
                Filter Results
              </span>

            </div>


            {/* CPSE FILTER */}

            <div className="nmc-filter-control">

              <Building2 size={15} />

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

              <ChevronDown size={14} />

            </div>


            {/* MATERIAL FILTER */}

            <div className="nmc-filter-control">

              <Package size={15} />

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

              <ChevronDown size={14} />

            </div>


            <button
              className="nmc-clear-button"
              onClick={clearFilters}
            >

              <RotateCcw size={14} />

              Clear Filters

            </button>

          </div>


          {/* =============================================
              TABLE
          ============================================= */}

          {filteredMaterials.length > 0 ? (

            <div className="nmc-table-container">

              <table className="nmc-table">

                <thead>

                  <tr>

                    <th>
                      NMC CODE
                    </th>

                    <th>
                      MATERIAL CODE
                    </th>

                    <th>
                      MATERIAL
                    </th>

                    <th>
                      CATEGORY
                    </th>

                    <th>
                      CPSE
                    </th>

                    <th>
                      STANDARD SPECIFICATION
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredMaterials.map(
                    (item, index) => (

                      <tr
                        key={`${item.material_id}-${index}`}
                      >

                        {/* NMC CODE */}

                        <td>

                          <span className="nmc-code-badge">

                            {item.nmc_code}

                          </span>

                        </td>


                        {/* ORIGINAL MATERIAL CODE */}

                        <td>

                          <span className="nmc-category">

                            {item.material_code || "—"}

                          </span>

                        </td>


                        {/* MATERIAL */}

                        <td>

                          <div className="nmc-material-name">

                            <Package size={16} />

                            <strong>
                              {item.material_description}
                            </strong>

                          </div>

                        </td>


                        {/* CATEGORY */}

                        <td>

                          <span className="nmc-category">

                            {item.category || "—"}

                          </span>

                        </td>


                        {/* CPSE */}

                        <td>

                          <span className="nmc-cpse">

                            {item.cpse_code}

                          </span>

                        </td>


                        {/* SPECIFICATION */}

                        <td>

                          <span className="nmc-specification">

                            {item.specification ||
                              item.material_description ||
                              "—"}

                          </span>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          ) : (

            <div className="nmc-empty-state">

              <AlertCircle size={30} />

              <h3>
                No materials found
              </h3>

              <p>
                No material matches the searched
                NMC code and filters.
              </p>

            </div>

          )}

        </section>

      )}


      {/* =================================================
          INITIAL STATE
      ================================================= */}

      {!searchedCode && !error && (

        <div className="nmc-initial-state">

          <Hash size={32} />

          <h3>
            Search an NMC Code
          </h3>

          <p>
            Enter an NMC code above to view
            the associated material.
          </p>

        </div>

      )}

    </div>

  );

}


export default NMCCode;
