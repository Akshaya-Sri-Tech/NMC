
import { useMemo, useState } from "react";

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


/* =========================================================
   DEMO NMC DATA

   Later this data can be replaced with backend API data.
========================================================= */

const nmcMaterials = [
  // =====================================================
  // NMC-0001842 — Bearings
  // =====================================================
  {
    id: 1,
    nmcCode: "NMC-0001842",
    material: "Ball Bearing",
    cpse: "IOCL",
    specification: "6205-2RS",
    unit: "Nos",
    description: "Deep groove ball bearing",
  },
  {
    id: 2,
    nmcCode: "NMC-0001842",
    material: "Ball Bearing",
    cpse: "BHEL",
    specification: "6205-ZZ",
    unit: "Nos",
    description: "Shielded ball bearing",
  },
  {
    id: 3,
    nmcCode: "NMC-0001842",
    material: "Ball Bearing",
    cpse: "BPCL",
    specification: "6205-2RS",
    unit: "Nos",
    description: "Rubber sealed bearing",
  },
  {
    id: 4,
    nmcCode: "NMC-0001842",
    material: "Ball Bearing",
    cpse: "ONGC",
    specification: "6205-C3",
    unit: "Nos",
    description: "High temperature bearing",
  },
  {
    id: 5,
    nmcCode: "NMC-0001842",
    material: "Deep Groove Bearing",
    cpse: "IOCL",
    specification: "6205-C3",
    unit: "Nos",
    description: "Clearance grade bearing",
  },
  {
    id: 6,
    nmcCode: "NMC-0001842",
    material: "Industrial Bearing",
    cpse: "BHEL",
    specification: "6205-2RS",
    unit: "Nos",
    description: "Industrial duty bearing",
  },
  {
    id: 7,
    nmcCode: "NMC-0001842",
    material: "Ball Bearing",
    cpse: "HPCL",
    specification: "6205-ZZ",
    unit: "Nos",
    description: "Metal shielded bearing",
  },
  {
    id: 8,
    nmcCode: "NMC-0001842",
    material: "Bearing Assembly",
    cpse: "ONGC",
    specification: "6205-C4",
    unit: "Nos",
    description: "High clearance bearing",
  },

  // =====================================================
  // NMC-0001843 — Pipes
  // =====================================================
  {
    id: 9,
    nmcCode: "NMC-0001843",
    material: "Steel Pipe",
    cpse: "ONGC",
    specification: "6 inch SCH 40",
    unit: "Meter",
    description: "Carbon steel process pipe",
  },
  {
    id: 10,
    nmcCode: "NMC-0001843",
    material: "Steel Pipe",
    cpse: "IOCL",
    specification: "6 inch SCH 40",
    unit: "Meter",
    description: "Seamless carbon steel pipe",
  },
  {
    id: 11,
    nmcCode: "NMC-0001843",
    material: "Carbon Steel Pipe",
    cpse: "BPCL",
    specification: "6 inch SCH 80",
    unit: "Meter",
    description: "Heavy duty process pipe",
  },
  {
    id: 12,
    nmcCode: "NMC-0001843",
    material: "Seamless Pipe",
    cpse: "HPCL",
    specification: "6 inch SCH 40",
    unit: "Meter",
    description: "Seamless industrial pipe",
  },
  {
    id: 13,
    nmcCode: "NMC-0001843",
    material: "Process Pipe",
    cpse: "ONGC",
    specification: "8 inch SCH 40",
    unit: "Meter",
    description: "Oil and gas process pipe",
  },
  {
    id: 14,
    nmcCode: "NMC-0001843",
    material: "Steel Pipe",
    cpse: "IOCL",
    specification: "8 inch SCH 80",
    unit: "Meter",
    description: "High pressure steel pipe",
  },
  {
    id: 15,
    nmcCode: "NMC-0001843",
    material: "Carbon Steel Pipe",
    cpse: "BHEL",
    specification: "6 inch SCH 40",
    unit: "Meter",
    description: "Fabricated carbon steel pipe",
  },
  {
    id: 16,
    nmcCode: "NMC-0001843",
    material: "Industrial Pipe",
    cpse: "BPCL",
    specification: "8 inch SCH 40",
    unit: "Meter",
    description: "Industrial grade pipe",
  },

  // =====================================================
  // NMC-0001844 — Industrial Valves
  // =====================================================
  {
    id: 17,
    nmcCode: "NMC-0001844",
    material: "Industrial Valve",
    cpse: "BPCL",
    specification: "150 NB Gate Valve",
    unit: "Nos",
    description: "Cast steel gate valve",
  },
  {
    id: 18,
    nmcCode: "NMC-0001844",
    material: "Industrial Valve",
    cpse: "IOCL",
    specification: "150 NB Gate Valve",
    unit: "Nos",
    description: "Process isolation valve",
  },
  {
    id: 19,
    nmcCode: "NMC-0001844",
    material: "Gate Valve",
    cpse: "ONGC",
    specification: "150 NB API 600",
    unit: "Nos",
    description: "API compliant gate valve",
  },
  {
    id: 20,
    nmcCode: "NMC-0001844",
    material: "Ball Valve",
    cpse: "HPCL",
    specification: "150 NB Full Bore",
    unit: "Nos",
    description: "Full bore ball valve",
  },
  {
    id: 21,
    nmcCode: "NMC-0001844",
    material: "Gate Valve",
    cpse: "BPCL",
    specification: "200 NB API 600",
    unit: "Nos",
    description: "Heavy duty gate valve",
  },
  {
    id: 22,
    nmcCode: "NMC-0001844",
    material: "Industrial Valve",
    cpse: "IOCL",
    specification: "200 NB Gate Valve",
    unit: "Nos",
    description: "Carbon steel valve",
  },
  {
    id: 23,
    nmcCode: "NMC-0001844",
    material: "Ball Valve",
    cpse: "ONGC",
    specification: "150 NB Full Bore",
    unit: "Nos",
    description: "Pipeline ball valve",
  },
  {
    id: 24,
    nmcCode: "NMC-0001844",
    material: "Process Valve",
    cpse: "BHEL",
    specification: "150 NB Gate Valve",
    unit: "Nos",
    description: "Industrial process valve",
  },

  // =====================================================
  // NMC-0001845 — Industrial Pumps
  // =====================================================
  {
    id: 25,
    nmcCode: "NMC-0001845",
    material: "Centrifugal Pump",
    cpse: "NTPC",
    specification: "50 HP Horizontal",
    unit: "Nos",
    description: "Horizontal centrifugal pump",
  },
  {
    id: 26,
    nmcCode: "NMC-0001845",
    material: "Centrifugal Pump",
    cpse: "BHEL",
    specification: "50 HP Horizontal",
    unit: "Nos",
    description: "Industrial centrifugal pump",
  },
  {
    id: 27,
    nmcCode: "NMC-0001845",
    material: "Process Pump",
    cpse: "IOCL",
    specification: "60 HP Horizontal",
    unit: "Nos",
    description: "Process transfer pump",
  },
  {
    id: 28,
    nmcCode: "NMC-0001845",
    material: "Water Pump",
    cpse: "ONGC",
    specification: "50 HP Vertical",
    unit: "Nos",
    description: "Vertical water pump",
  },
  {
    id: 29,
    nmcCode: "NMC-0001845",
    material: "Centrifugal Pump",
    cpse: "NTPC",
    specification: "75 HP Horizontal",
    unit: "Nos",
    description: "High capacity centrifugal pump",
  },
  {
    id: 30,
    nmcCode: "NMC-0001845",
    material: "Process Pump",
    cpse: "BHEL",
    specification: "60 HP Horizontal",
    unit: "Nos",
    description: "Process circulation pump",
  },
  {
    id: 31,
    nmcCode: "NMC-0001845",
    material: "Industrial Pump",
    cpse: "IOCL",
    specification: "50 HP Horizontal",
    unit: "Nos",
    description: "Industrial duty pump",
  },
  {
    id: 32,
    nmcCode: "NMC-0001845",
    material: "Centrifugal Pump",
    cpse: "ONGC",
    specification: "75 HP Vertical",
    unit: "Nos",
    description: "High pressure pump",
  },

  // =====================================================
  // NMC-0001846 — Pressure Gauges
  // =====================================================
  {
    id: 33,
    nmcCode: "NMC-0001846",
    material: "Pressure Gauge",
    cpse: "CPCL",
    specification: "0-10 Bar",
    unit: "Nos",
    description: "Industrial pressure gauge",
  },
  {
    id: 34,
    nmcCode: "NMC-0001846",
    material: "Pressure Gauge",
    cpse: "IOCL",
    specification: "0-16 Bar",
    unit: "Nos",
    description: "Bourdon tube pressure gauge",
  },
  {
    id: 35,
    nmcCode: "NMC-0001846",
    material: "Pressure Gauge",
    cpse: "BPCL",
    specification: "0-10 Bar",
    unit: "Nos",
    description: "Process pressure gauge",
  },
  {
    id: 36,
    nmcCode: "NMC-0001846",
    material: "Pressure Gauge",
    cpse: "ONGC",
    specification: "0-16 Bar",
    unit: "Nos",
    description: "Stainless steel pressure gauge",
  },
  {
    id: 37,
    nmcCode: "NMC-0001846",
    material: "Industrial Gauge",
    cpse: "CPCL",
    specification: "0-25 Bar",
    unit: "Nos",
    description: "High range pressure gauge",
  },
  {
    id: 38,
    nmcCode: "NMC-0001846",
    material: "Pressure Gauge",
    cpse: "IOCL",
    specification: "0-10 Bar",
    unit: "Nos",
    description: "Panel mounted gauge",
  },
  {
    id: 39,
    nmcCode: "NMC-0001846",
    material: "Process Gauge",
    cpse: "BPCL",
    specification: "0-16 Bar",
    unit: "Nos",
    description: "Refinery process gauge",
  },
  {
    id: 40,
    nmcCode: "NMC-0001846",
    material: "Pressure Gauge",
    cpse: "ONGC",
    specification: "0-25 Bar",
    unit: "Nos",
    description: "Oil and gas pressure gauge",
  },
];

function NMCCode() {

  /* =======================================================
     STATE
  ======================================================= */

  const [nmcSearch, setNmcSearch] = useState("");

  const [searchedCode, setSearchedCode] =
    useState("");

  const [cpseFilter, setCpseFilter] =
    useState("All CPSEs");

  const [materialFilter, setMaterialFilter] =
    useState("All Materials");


  /* =======================================================
     SEARCH NMC CODE
  ======================================================= */

  const handleSearch = () => {

    const value = nmcSearch.trim().toUpperCase();

    if (!value) {
      setSearchedCode("");
      return;
    }

    setSearchedCode(value);

    /* Reset filters whenever a new NMC code is searched */
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
const availableMaterials = useMemo(() => {

  if (!searchedCode) {
    return [];
  }

  const results = nmcMaterials.filter(
    (item) =>
      item.nmcCode === searchedCode
  );

  return [
    ...new Set(
      results.map(
        (item) => item.material
      )
    ),
  ];

}, [searchedCode]);


  const availableCPSEs = useMemo(() => {

    if (!searchedCode) {
      return [];
    }

    const results = nmcMaterials.filter(
      (item) =>
        item.nmcCode === searchedCode
    );

    return [
      ...new Set(
        results.map(
          (item) => item.cpse
        )
      ),
    ];

  }, [searchedCode]);


  /* =======================================================
     FILTER RESULTS
  ======================================================= */

  const filteredMaterials = useMemo(() => {

    if (!searchedCode) {
      return [];
    }

    return nmcMaterials.filter((item) => {

      const codeMatch =
        item.nmcCode === searchedCode;

      const cpseMatch =
        cpseFilter === "All CPSEs" ||
        item.cpse === cpseFilter;

      const materialMatch =
  materialFilter === "All Materials" ||
  item.material === materialFilter;

      return (
        codeMatch &&
        cpseMatch &&
        materialMatch
      );

    });

  }, [
    searchedCode,
    cpseFilter,
    materialFilter,
  ]);


  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  const clearFilters = () => {

    setCpseFilter("All CPSEs");
    setMaterialFilter("All Materials");

  };


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
            Search a National Material Code and
            view all materials mapped across CPSEs.
          </p>

        </div>

      </div>


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
                Enter an NMC code to view all
                associated materials.
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
              placeholder="Enter NMC code e.g. NMC-0001842"
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
                Materials mapped to this
                standardized code
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
                  (category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
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
                        key={`${item.nmcCode}-${item.cpse}-${index}`}
                      >

                        <td>

                          <span className="nmc-code-badge">
                            {item.nmcCode}
                          </span>

                        </td>


                        <td>

                          <div className="nmc-material-name">

                            <Package size={16} />

                            <strong>
                              {item.material}
                            </strong>

                          </div>

                        </td>


                        <td>

                          <span className="nmc-category">
                            {item.category}
                          </span>

                        </td>


                        <td>

                          <span className="nmc-cpse">
                            {item.cpse}
                          </span>

                        </td>


                        <td>

                          <span className="nmc-specification">
                            {item.specification}
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
                No materials match the selected
                CPSE and material filters.
              </p>

            </div>

          )}

        </section>

      )}


      {/* =================================================
          INITIAL STATE
      ================================================= */}

      {!searchedCode && (

        <div className="nmc-initial-state">

          <Hash size={32} />

          <h3>
            Search an NMC Code
          </h3>

          <p>
            Enter an NMC code above to view
            all materials mapped across CPSEs.
          </p>

        </div>

      )}

    </div>
  );
}


export default NMCCode;


