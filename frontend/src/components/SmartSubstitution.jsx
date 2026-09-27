import { useMemo, useState } from "react";

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

/* =========================================================
   DEMO SMART SUBSTITUTION DATA
========================================================= */

/* =========================================================
   DEMO SMART SUBSTITUTION DATA
========================================================= */

const substitutionData = [
  // =====================================================
  // NMC-0001842 — Bearings
  // =====================================================
  {
    id: 1,
    nmcCode: "NMC-0001842",
    material: "Ball Bearing",
    cpse: "IOCL",
    specification: "6205-2RS",
    price: 1240,
    availability: "Available",
    compatibility: "Compatible",
  },
  {
    id: 2,
    nmcCode: "NMC-0001842",
    material: "Ball Bearing",
    cpse: "BHEL",
    specification: "6205-ZZ",
    price: 1275,
    availability: "Limited",
    compatibility: "Compatible",
  },
  {
    id: 3,
    nmcCode: "NMC-0001842",
    material: "Ball Bearing",
    cpse: "BPCL",
    specification: "6205-2RS",
    price: 1310,
    availability: "Available",
    compatibility: "Compatible",
  },
  {
    id: 4,
    nmcCode: "NMC-0001842",
    material: "Ball Bearing",
    cpse: "ONGC",
    specification: "6205-C3",
    price: 1980,
    availability: "Limited",
    compatibility: "Conditional",
  },
  {
    id: 5,
    nmcCode: "NMC-0001842",
    material: "Deep Groove Bearing",
    cpse: "IOCL",
    specification: "6205-C3",
    price: 1420,
    availability: "Available",
    compatibility: "Compatible",
  },
  {
    id: 6,
    nmcCode: "NMC-0001842",
    material: "Industrial Bearing",
    cpse: "BHEL",
    specification: "6205-2RS",
    price: 1560,
    availability: "Available",
    compatibility: "Compatible",
  },
  {
    id: 7,
    nmcCode: "NMC-0001842",
    material: "Ball Bearing",
    cpse: "HPCL",
    specification: "6205-ZZ",
    price: 1690,
    availability: "Limited",
    compatibility: "Conditional",
  },
  {
    id: 8,
    nmcCode: "NMC-0001842",
    material: "Bearing Assembly",
    cpse: "ONGC",
    specification: "6205-C4",
    price: 2450,
    availability: "Available",
    compatibility: "Incompatible",
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
    price: 48500,
    availability: "Available",
    compatibility: "Compatible",
  },
  {
    id: 10,
    nmcCode: "NMC-0001843",
    material: "Steel Pipe",
    cpse: "IOCL",
    specification: "6 inch SCH 40",
    price: 49200,
    availability: "Available",
    compatibility: "Compatible",
  },
  {
    id: 11,
    nmcCode: "NMC-0001843",
    material: "Carbon Steel Pipe",
    cpse: "BPCL",
    specification: "6 inch SCH 80",
    price: 51500,
    availability: "Limited",
    compatibility: "Conditional",
  },
  {
    id: 12,
    nmcCode: "NMC-0001843",
    material: "Seamless Pipe",
    cpse: "HPCL",
    specification: "6 inch SCH 40",
    price: 68200,
    availability: "Available",
    compatibility: "Compatible",
  },
  {
    id: 13,
    nmcCode: "NMC-0001843",
    material: "Process Pipe",
    cpse: "ONGC",
    specification: "8 inch SCH 40",
    price: 53800,
    availability: "Available",
    compatibility: "Conditional",
  },
  {
    id: 14,
    nmcCode: "NMC-0001843",
    material: "Steel Pipe",
    cpse: "IOCL",
    specification: "8 inch SCH 80",
    price: 55700,
    availability: "Limited",
    compatibility: "Incompatible",
  },
  {
    id: 15,
    nmcCode: "NMC-0001843",
    material: "Carbon Steel Pipe",
    cpse: "BHEL",
    specification: "6 inch SCH 40",
    price: 52100,
    availability: "Available",
    compatibility: "Compatible",
  },
  {
    id: 16,
    nmcCode: "NMC-0001843",
    material: "Industrial Pipe",
    cpse: "BPCL",
    specification: "8 inch SCH 40",
    price: 79500,
    availability: "Limited",
    compatibility: "Incompatible",
  },

  // =====================================================
  // NMC-0001844 — Valves
  // =====================================================
  {
    id: 17,
    nmcCode: "NMC-0001844",
    material: "Industrial Valve",
    cpse: "BPCL",
    specification: "150 NB Gate Valve",
    price: 8200,
    availability: "Available",
    compatibility: "Compatible",
  },
  {
    id: 18,
    nmcCode: "NMC-0001844",
    material: "Industrial Valve",
    cpse: "IOCL",
    specification: "150 NB Gate Valve",
    price: 8450,
    availability: "Available",
    compatibility: "Compatible",
  },
  {
    id: 19,
    nmcCode: "NMC-0001844",
    material: "Gate Valve",
    cpse: "ONGC",
    specification: "150 NB API 600",
    price: 8700,
    availability: "Limited",
    compatibility: "Conditional",
  },
  {
    id: 20,
    nmcCode: "NMC-0001844",
    material: "Ball Valve",
    cpse: "HPCL",
    specification: "150 NB Full Bore",
    price: 12900,
    availability: "Available",
    compatibility: "Compatible",
  },
  {
    id: 21,
    nmcCode: "NMC-0001844",
    material: "Gate Valve",
    cpse: "BPCL",
    specification: "200 NB API 600",
    price: 9100,
    availability: "Available",
    compatibility: "Conditional",
  },
  {
    id: 22,
    nmcCode: "NMC-0001844",
    material: "Industrial Valve",
    cpse: "IOCL",
    specification: "200 NB Gate Valve",
    price: 9350,
    availability: "Limited",
    compatibility: "Incompatible",
  },
  {
    id: 23,
    nmcCode: "NMC-0001844",
    material: "Ball Valve",
    cpse: "ONGC",
    specification: "150 NB Full Bore",
    price: 9750,
    availability: "Available",
    compatibility: "Compatible",
  },
  {
    id: 24,
    nmcCode: "NMC-0001844",
    material: "Process Valve",
    cpse: "BHEL",
    specification: "150 NB Gate Valve",
    price: 14600,
    availability: "Limited",
    compatibility: "Incompatible",
  },

  // =====================================================
  // NMC-0001845 — Pumps
  // =====================================================
  {
    id: 25,
    nmcCode: "NMC-0001845",
    material: "Centrifugal Pump",
    cpse: "NTPC",
    specification: "50 HP Horizontal",
    price: 84500,
    availability: "Available",
    compatibility: "Compatible",
  },
  {
    id: 26,
    nmcCode: "NMC-0001845",
    material: "Centrifugal Pump",
    cpse: "BHEL",
    specification: "50 HP Horizontal",
    price: 87200,
    availability: "Limited",
    compatibility: "Compatible",
  },
  {
    id: 27,
    nmcCode: "NMC-0001845",
    material: "Process Pump",
    cpse: "IOCL",
    specification: "60 HP Horizontal",
    price: 91800,
    availability: "Available",
    compatibility: "Conditional",
  },
  {
    id: 28,
    nmcCode: "NMC-0001845",
    material: "Water Pump",
    cpse: "ONGC",
    specification: "50 HP Vertical",
    price: 128500,
    availability: "Available",
    compatibility: "Incompatible",
  },
  {
    id: 29,
    nmcCode: "NMC-0001845",
    material: "Centrifugal Pump",
    cpse: "NTPC",
    specification: "75 HP Horizontal",
    price: 96500,
    availability: "Available",
    compatibility: "Conditional",
  },
  {
    id: 30,
    nmcCode: "NMC-0001845",
    material: "Process Pump",
    cpse: "BHEL",
    specification: "60 HP Horizontal",
    price: 101200,
    availability: "Limited",
    compatibility: "Compatible",
  },
  {
    id: 31,
    nmcCode: "NMC-0001845",
    material: "Industrial Pump",
    cpse: "IOCL",
    specification: "50 HP Horizontal",
    price: 98700,
    availability: "Available",
    compatibility: "Compatible",
  },
  {
    id: 32,
    nmcCode: "NMC-0001845",
    material: "Centrifugal Pump",
    cpse: "ONGC",
    specification: "75 HP Vertical",
    price: 151000,
    availability: "Limited",
    compatibility: "Incompatible",
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
    price: 3250,
    availability: "Available",
    compatibility: "Compatible",
  },
  {
    id: 34,
    nmcCode: "NMC-0001846",
    material: "Pressure Gauge",
    cpse: "IOCL",
    specification: "0-16 Bar",
    price: 3400,
    availability: "Available",
    compatibility: "Compatible",
  },
  {
    id: 35,
    nmcCode: "NMC-0001846",
    material: "Pressure Gauge",
    cpse: "BPCL",
    specification: "0-10 Bar",
    price: 3520,
    availability: "Limited",
    compatibility: "Compatible",
  },
  {
    id: 36,
    nmcCode: "NMC-0001846",
    material: "Pressure Gauge",
    cpse: "ONGC",
    specification: "0-16 Bar",
    price: 4900,
    availability: "Available",
    compatibility: "Conditional",
  },
  {
    id: 37,
    nmcCode: "NMC-0001846",
    material: "Industrial Gauge",
    cpse: "CPCL",
    specification: "0-25 Bar",
    price: 4100,
    availability: "Available",
    compatibility: "Conditional",
  },
  {
    id: 38,
    nmcCode: "NMC-0001846",
    material: "Pressure Gauge",
    cpse: "IOCL",
    specification: "0-10 Bar",
    price: 3750,
    availability: "Limited",
    compatibility: "Compatible",
  },
  {
    id: 39,
    nmcCode: "NMC-0001846",
    material: "Process Gauge",
    cpse: "BPCL",
    specification: "0-16 Bar",
    price: 4280,
    availability: "Available",
    compatibility: "Incompatible",
  },
  {
    id: 40,
    nmcCode: "NMC-0001846",
    material: "Pressure Gauge",
    cpse: "ONGC",
    specification: "0-25 Bar",
    price: 7200,
    availability: "Limited",
    compatibility: "Incompatible",
  },
];

/* =========================================================
   COMPONENT
========================================================= */

function SmartSubstitution() {
  const [search, setSearch] = useState("");
  const [searchedValue, setSearchedValue] = useState("");

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
     SEARCH
  ========================================================= */

  const handleSearch = () => {
    const value = search.trim();

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
        item.nmcCode
          .toLowerCase()
          .includes(searchLower) ||
        item.material
          .toLowerCase()
          .includes(searchLower)
    );
  }, [searchedValue]);

  /* =========================================================
     FILTER OPTIONS
  ========================================================= */

  const availableCPSEs = useMemo(() => {
    return [
      ...new Set(
        searchedData.map((item) => item.cpse)
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
      .sort((a, b) => a.price - b.price);
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
        item.availability === "Available"
    ).length;

  const compatibleCount =
    filteredData.filter(
      (item) =>
        item.compatibility === "Compatible"
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
              Search using an NMC code or
              material name.
            </span>

          </div>

        </div>

        <div className="substitution-search-row">

          <div className="substitution-search-input">

            <Search size={17} />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="Enter NMC code or material name..."
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
                    NMC CODE
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
                      key={`${item.nmcCode}-${item.cpse}-${index}`}
                      onClick={() =>
                        setSelectedMaterial(
                          item
                        )
                      }
                    >

                      <td>

                        <span className="substitution-nmc-code">

                          {item.nmcCode}

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
      item.compatibility === "Compatible"
        ? "compatible"
        : item.compatibility === "Conditional"
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
              Try another NMC code, material
              name or filter combination.
            </p>

          </div>

        ) : (

          <div className="substitution-initial-state">

            <ArrowRightLeft size={34} />

            <h3>
              Search for a material
            </h3>

            <p>
              Enter an NMC code or material
              name above to view compatible
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

              {selectedMaterial.nmcCode}

            </div>

            <div className="substitution-detail-grid">

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

            </div>

            <div className="substitution-detail-status">

              <CheckCircle2 size={18} />

              <div>

                <strong>
                  Compatible Material
                </strong>

                <span>
                  This material matches the
                  required specification and can
                  be considered as a substitution
                  option.
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
                  Current availability status
                  reported by {selectedMaterial.cpse}.
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