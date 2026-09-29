
import { useMemo, useState } from "react";

import {
  Search,
  Database,
  Building2,
  Package,
  Hash,
  Filter,
  RotateCcw,
  ChevronDown,
} from "lucide-react";


/* =========================================================
   MASTER DATABASE
   Hardcoded frontend data for prototype/demo
========================================================= */

const masterDBData = [
  {
    cpse: "ONGC",
    materialCode: "ONGC-BLT-001",
    materialDescription: "HEX BOLT M20 X 80 GRADE 8.8",
    specification: "M20 x 80 MM, HIGH TENSILE GRADE 8.8, FULL THREAD",
    category: "Fasteners",
    nmcCode: "NMC-BLT-0001",
    stdDescription: "M20 X 80 HIGH TENSILE HEX BOLT",
    stdSpecification: "M20 x 80 MM, GRADE 8.8, FULL THREAD",
    nmcCategory: "Fasteners",
  },

  {
    cpse: "CPCL",
    materialCode: "CPCL-BLT-001",
    materialDescription: "HEX BOLT M20 X 80 GRADE 8.8",
    specification: "M20 x 80 MM, HIGH TENSILE GRADE 8.8, FULL THREAD",
    category: "Fasteners",
    nmcCode: "NMC-BLT-0001",
    stdDescription: "M20 X 80 HIGH TENSILE HEX BOLT",
    stdSpecification: "M20 x 80 MM, GRADE 8.8, FULL THREAD",
    nmcCategory: "Fasteners",
  },

  {
    cpse: "SAIL",
    materialCode: "SAIL-BLT-045",
    materialDescription: "M20 X 80 HIGH TENSILE HEX BOLT",
    specification: "M20 x 80 MM, HIGH TENSILE STEEL",
    category: "Fasteners",
    nmcCode: "NMC-BLT-0001",
    stdDescription: "M20 X 80 HIGH TENSILE HEX BOLT",
    stdSpecification: "M20 x 80 MM, GRADE 8.8, FULL THREAD",
    nmcCategory: "Fasteners",
  },

  {
    cpse: "ONGC",
    materialCode: "ONGC-VAL-001",
    materialDescription: "BALL VALVE 2 IN SS304 CL300",
    specification: "2 INCH, SS304, PRESSURE CLASS 300, RF",
    category: "Valves",
    nmcCode: "NMC-VLV-0002",
    stdDescription: "2 INCH SS304 CLASS 300 BALL VALVE",
    stdSpecification: "2 INCH, SS304, CLASS 300, RF CONNECTION",
    nmcCategory: "Valves",
  },

  {
    cpse: "CPCL",
    materialCode: "CPCL-VAL-019",
    materialDescription:
      "STAINLESS STEEL 304 BALL VALVE 2 INCH CLASS 300",
    specification: "2 INCH, SS304, CLASS 300, RF",
    category: "Valves",
    nmcCode: "NMC-VLV-0002",
    stdDescription: "2 INCH SS304 CLASS 300 BALL VALVE",
    stdSpecification: "2 INCH, SS304, CLASS 300, RF CONNECTION",
    nmcCategory: "Valves",
  },

  {
    cpse: "ONGC",
    materialCode: "ONGC-PIPE-001",
    materialDescription:
      "SEAMLESS PIPE 4 INCH SCH 40 A106 GR B",
    specification: "4 INCH, SCH 40, ASTM A106 GR B",
    category: "Pipes",
    nmcCode: "NMC-PIP-0003",
    stdDescription: "4 INCH SEAMLESS CARBON STEEL PIPE",
    stdSpecification: "4 INCH, SCH 40, ASTM A106 GR B",
    nmcCategory: "Pipes",
  },

  {
    cpse: "CPCL",
    materialCode: "CPCL-PIPE-021",
    materialDescription:
      "4 INCH SEAMLESS CARBON STEEL PIPE SCH40",
    specification: "4 INCH, SEAMLESS, SCH 40",
    category: "Pipes",
    nmcCode: "NMC-PIP-0003",
    stdDescription: "4 INCH SEAMLESS CARBON STEEL PIPE",
    stdSpecification: "4 INCH, SCH 40, ASTM A106 GR B",
    nmcCategory: "Pipes",
  },

  {
    cpse: "ONGC",
    materialCode: "ONGC-CBL-007",
    materialDescription:
      "3C X 240 SQMM XLPE ARMOURED CABLE 11KV",
    specification:
      "3 CORE, 240 SQMM, XLPE, ARMOURED, 11KV",
    category: "Cables",
    nmcCode: "NMC-CBL-0004",
    stdDescription: "11KV XLPE ARMOURED POWER CABLE",
    stdSpecification:
      "3 CORE X 240 SQMM, XLPE, ARMOURED, 11KV",
    nmcCategory: "Cables",
  },

  {
    cpse: "CPCL",
    materialCode: "CPCL-CBL-014",
    materialDescription:
      "11KV XLPE ARMOURED POWER CABLE 3C X 240 SQMM",
    specification:
      "3 CORE X 240 SQMM, XLPE ARMOURED, 11KV",
    category: "Cables",
    nmcCode: "NMC-CBL-0004",
    stdDescription: "11KV XLPE ARMOURED POWER CABLE",
    stdSpecification:
      "3 CORE X 240 SQMM, XLPE, ARMOURED, 11KV",
    nmcCategory: "Cables",
  },

  {
    cpse: "NMDC",
    materialCode: "NMDC-BRG-013",
    materialDescription:
      "DEEP GROOVE BALL BEARING 6205",
    specification:
      "BEARING 6205, DEEP GROOVE, SINGLE ROW",
    category: "Bearings",
    nmcCode: "NMC-BRG-0005",
    stdDescription:
      "DEEP GROOVE BALL BEARING 6205",
    stdSpecification:
      "6205, DEEP GROOVE, SINGLE ROW",
    nmcCategory: "Bearings",
  },
];


function MasterDB() {

  const [search, setSearch] = useState("");

  const [cpseFilter, setCpseFilter] =
    useState("All CPSEs");

  const [categoryFilter, setCategoryFilter] =
    useState("All Categories");


  /* =========================================================
     FILTER OPTIONS
  ========================================================= */

  const cpseOptions = useMemo(() => {

    return [
      ...new Set(
        masterDBData.map(
          (item) => item.cpse
        )
      ),
    ];

  }, []);


  const categoryOptions = useMemo(() => {

    return [
      ...new Set(
        masterDBData.map(
          (item) => item.category
        )
      ),
    ];

  }, []);


  /* =========================================================
     FILTER DATA
  ========================================================= */

  const filteredData = useMemo(() => {

    const query =
      search.trim().toLowerCase();

    return masterDBData.filter((item) => {

      const matchesSearch =
        !query ||
        item.cpse
          .toLowerCase()
          .includes(query) ||
        item.materialCode
          .toLowerCase()
          .includes(query) ||
        item.materialDescription
          .toLowerCase()
          .includes(query) ||
        item.nmcCode
          .toLowerCase()
          .includes(query) ||
        item.stdDescription
          .toLowerCase()
          .includes(query);

      const matchesCPSE =
        cpseFilter === "All CPSEs" ||
        item.cpse === cpseFilter;

      const matchesCategory =
        categoryFilter === "All Categories" ||
        item.category === categoryFilter;

      return (
        matchesSearch &&
        matchesCPSE &&
        matchesCategory
      );

    });

  }, [
    search,
    cpseFilter,
    categoryFilter,
  ]);


  /* =========================================================
     RESET FILTERS
  ========================================================= */

  const resetFilters = () => {

    setSearch("");
    setCpseFilter("All CPSEs");
    setCategoryFilter("All Categories");

  };


  return (

    <div className="master-db-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="master-db-header">

        <div>

          <div className="master-db-eyebrow">
            MATERIAL INTELLIGENCE
          </div>

          <div className="master-db-title-row">

            <Database size={24} />

            <h2>
              Master Database
            </h2>

          </div>

          <p>
            Unified view of CPSE material records
            and their standardized NMC mappings.
          </p>

        </div>


        <div className="master-db-record-count">

          <span>
            MASTER RECORDS
          </span>

          <strong>
            {masterDBData.length}
          </strong>

        </div>

      </div>


      {/* =====================================================
          SEARCH / FILTER PANEL
      ===================================================== */}

      <section className="master-db-filter-panel">

        <div className="master-db-search">

          <Search size={17} />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search material code, description, NMC code or CPSE..."
          />

        </div>


        <div className="master-db-filter">

          <Building2 size={15} />

          <select
            value={cpseFilter}
            onChange={(event) =>
              setCpseFilter(event.target.value)
            }
          >

            <option>
              All CPSEs
            </option>

            {cpseOptions.map((cpse) => (

              <option
                key={cpse}
                value={cpse}
              >
                {cpse}
              </option>

            ))}

          </select>

          <ChevronDown size={14} />

        </div>


        <div className="master-db-filter">

          <Package size={15} />

          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(
                event.target.value
              )
            }
          >

            <option>
              All Categories
            </option>

            {categoryOptions.map(
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
          className="master-db-reset"
          onClick={resetFilters}
        >

          <RotateCcw size={14} />

          Reset

        </button>

      </section>


      {/* =====================================================
          TABLE SECTION
      ===================================================== */}

      <section className="master-db-table-section">


        {/* TABLE HEADER */}

        <div className="master-db-table-heading">

          <div>

            <div className="master-db-table-eyebrow">
              MASTER MATERIAL REGISTRY
            </div>

            <h3>
              CPSE to NMC Mapping
            </h3>

          </div>


          <div className="master-db-result-info">

            <Filter size={14} />

            <strong>
              {filteredData.length}
            </strong>

            <span>
              records shown
            </span>

          </div>

        </div>


        {/* TABLE */}

        {filteredData.length > 0 ? (

          <div className="master-db-table-wrap">

            <table className="master-db-table">

              <thead>

                {/* GROUP HEADERS */}

                <tr className="master-db-group-row">

                  <th
                    colSpan="5"
                    className="master-db-cpse-group"
                  >
                    <div>
                      <Building2 size={15} />
                      CPSE DATA
                    </div>
                  </th>

                  <th
                    colSpan="4"
                    className="master-db-nmc-group"
                  >
                    <div>
                      <Hash size={15} />
                      NMC DATA
                    </div>
                  </th>

                </tr>


                {/* COLUMN HEADERS */}

                <tr className="master-db-column-row">

                  <th>
                    CPSE CODE / NAME
                  </th>

                  <th>
                    MATERIAL CODE
                  </th>

                  <th>
                    MATERIAL DESCRIPTION
                  </th>

                  <th>
                    SPECIFICATION
                  </th>

                  <th>
                    CATEGORY
                  </th>

                  <th>
                    NMC CODE
                  </th>

                  <th>
                    STD. DESCRIPTION
                  </th>

                  <th>
                    STD. SPECIFICATION
                  </th>

                  <th>
                    CATEGORY
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredData.map(
                  (item, index) => (

                    <tr
                      key={`${item.materialCode}-${index}`}
                    >

                      {/* CPSE */}

                      <td>

                        <span className="master-db-cpse">

                          <Building2 size={14} />

                          {item.cpse}

                        </span>

                      </td>


                      <td>

                        <span className="master-db-material-code">

                          {item.materialCode}

                        </span>

                      </td>


                      <td>

                        <div className="master-db-description">

                          <Package size={14} />

                          <strong>
                            {item.materialDescription}
                          </strong>

                        </div>

                      </td>


                      <td>

                        <span className="master-db-spec">

                          {item.specification}

                        </span>

                      </td>


                      <td>

                        <span className="master-db-category">

                          {item.category}

                        </span>

                      </td>


                      {/* NMC */}

                      <td>

                        <span className="master-db-nmc-code">

                          {item.nmcCode}

                        </span>

                      </td>


                      <td>

                        <span className="master-db-standard-description">

                          {item.stdDescription}

                        </span>

                      </td>


                      <td>

                        <span className="master-db-standard-spec">

                          {item.stdSpecification}

                        </span>

                      </td>


                      <td>

                        <span className="master-db-nmc-category">

                          {item.nmcCategory}

                        </span>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        ) : (

          <div className="master-db-empty">

            <Database size={30} />

            <h3>
              No records found
            </h3>

            <p>
              No master database records match
              the current search and filters.
            </p>

            <button
              onClick={resetFilters}
            >
              Clear Filters
            </button>

          </div>

        )}

      </section>


      {/* =====================================================
          FOOTER NOTE
      ===================================================== */}

      <div className="master-db-note">

        <Database size={14} />

        <span>
          Master database currently uses
          hardcoded prototype records.
          Backend integration can replace this
          dataset without changing the table structure.
        </span>

      </div>

    </div>

  );

}


export default MasterDB;

