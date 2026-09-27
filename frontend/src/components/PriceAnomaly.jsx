
import { useMemo, useState } from "react";

import {
  Search,
  Filter,
  RotateCcw,
  Package,
  Building2,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  X,
} from "lucide-react";


/* =========================================================
   DEMO PRICE DATA

   Later this can be replaced with backend API data.
========================================================= */

const priceData = [
  // =====================================================
  // NMC-0001842 — Bearings
  // =====================================================
  {
    id: 1,
    nmcCode: "NMC-0001842",
    material: "Ball Bearing",
    cpse: "IOCL",
    price: 1240,
    unit: "Nos",
    status: "Normal",
  },
  {
    id: 2,
    nmcCode: "NMC-0001842",
    material: "Ball Bearing",
    cpse: "BHEL",
    price: 1275,
    unit: "Nos",
    status: "Normal",
  },
  {
    id: 3,
    nmcCode: "NMC-0001842",
    material: "Ball Bearing",
    cpse: "BPCL",
    price: 1310,
    unit: "Nos",
    status: "Normal",
  },
  {
    id: 4,
    nmcCode: "NMC-0001842",
    material: "Ball Bearing",
    cpse: "ONGC",
    price: 1980,
    unit: "Nos",
    status: "Anomaly",
  },
  {
    id: 5,
    nmcCode: "NMC-0001842",
    material: "Ball Bearing",
    cpse: "IOCL",
    price: 1420,
    unit: "Nos",
    status: "Normal",
  },
  {
    id: 6,
    nmcCode: "NMC-0001842",
    material: "Industrial Bearing",
    cpse: "BHEL",
    price: 1560,
    unit: "Nos",
    status: "Normal",
  },
  {
    id: 7,
    nmcCode: "NMC-0001842",
    material: "Ball Bearing",
    cpse: "HPCL",
    price: 1690,
    unit: "Nos",
    status: "Normal",
  },
  {
    id: 8,
    nmcCode: "NMC-0001842",
    material: "Bearing Assembly",
    cpse: "ONGC",
    price: 2450,
    unit: "Nos",
    status: "Anomaly",
  },

  // =====================================================
  // NMC-0001843 — Pipes
  // =====================================================
  {
    id: 9,
    nmcCode: "NMC-0001843",
    material: "Steel Pipe",
    cpse: "ONGC",
    price: 48500,
    unit: "Meter",
    status: "Normal",
  },
  {
    id: 10,
    nmcCode: "NMC-0001843",
    material: "Steel Pipe",
    cpse: "IOCL",
    price: 49200,
    unit: "Meter",
    status: "Normal",
  },
  {
    id: 11,
    nmcCode: "NMC-0001843",
    material: "Carbon Steel Pipe",
    cpse: "BPCL",
    price: 51500,
    unit: "Meter",
    status: "Normal",
  },
  {
    id: 12,
    nmcCode: "NMC-0001843",
    material: "Seamless Pipe",
    cpse: "HPCL",
    price: 68200,
    unit: "Meter",
    status: "Anomaly",
  },
  {
    id: 13,
    nmcCode: "NMC-0001843",
    material: "Process Pipe",
    cpse: "ONGC",
    price: 53800,
    unit: "Meter",
    status: "Normal",
  },
  {
    id: 14,
    nmcCode: "NMC-0001843",
    material: "Steel Pipe",
    cpse: "IOCL",
    price: 55700,
    unit: "Meter",
    status: "Normal",
  },
  {
    id: 15,
    nmcCode: "NMC-0001843",
    material: "Carbon Steel Pipe",
    cpse: "BHEL",
    price: 52100,
    unit: "Meter",
    status: "Normal",
  },
  {
    id: 16,
    nmcCode: "NMC-0001843",
    material: "Industrial Pipe",
    cpse: "BPCL",
    price: 79500,
    unit: "Meter",
    status: "Anomaly",
  },

  // =====================================================
  // NMC-0001844 — Valves
  // =====================================================
  {
    id: 17,
    nmcCode: "NMC-0001844",
    material: "Industrial Valve",
    cpse: "BPCL",
    price: 8200,
    unit: "Nos",
    status: "Normal",
  },
  {
    id: 18,
    nmcCode: "NMC-0001844",
    material: "Industrial Valve",
    cpse: "IOCL",
    price: 8450,
    unit: "Nos",
    status: "Normal",
  },
  {
    id: 19,
    nmcCode: "NMC-0001844",
    material: "Gate Valve",
    cpse: "ONGC",
    price: 8700,
    unit: "Nos",
    status: "Normal",
  },
  {
    id: 20,
    nmcCode: "NMC-0001844",
    material: "Ball Valve",
    cpse: "HPCL",
    price: 12900,
    unit: "Nos",
    status: "Anomaly",
  },
  {
    id: 21,
    nmcCode: "NMC-0001844",
    material: "Gate Valve",
    cpse: "BPCL",
    price: 9100,
    unit: "Nos",
    status: "Normal",
  },
  {
    id: 22,
    nmcCode: "NMC-0001844",
    material: "Industrial Valve",
    cpse: "IOCL",
    price: 9350,
    unit: "Nos",
    status: "Normal",
  },
  {
    id: 23,
    nmcCode: "NMC-0001844",
    material: "Ball Valve",
    cpse: "ONGC",
    price: 9750,
    unit: "Nos",
    status: "Normal",
  },
  {
    id: 24,
    nmcCode: "NMC-0001844",
    material: "Process Valve",
    cpse: "BHEL",
    price: 14600,
    unit: "Nos",
    status: "Anomaly",
  },

  // =====================================================
  // NMC-0001845 — Pumps
  // =====================================================
  {
    id: 25,
    nmcCode: "NMC-0001845",
    material: "Centrifugal Pump",
    cpse: "NTPC",
    price: 84500,
    unit: "Nos",
    status: "Normal",
  },
  {
    id: 26,
    nmcCode: "NMC-0001845",
    material: "Centrifugal Pump",
    cpse: "BHEL",
    price: 87200,
    unit: "Nos",
    status: "Normal",
  },
  {
    id: 27,
    nmcCode: "NMC-0001845",
    material: "Process Pump",
    cpse: "IOCL",
    price: 91800,
    unit: "Nos",
    status: "Normal",
  },
  {
    id: 28,
    nmcCode: "NMC-0001845",
    material: "Water Pump",
    cpse: "ONGC",
    price: 128500,
    unit: "Nos",
    status: "Anomaly",
  },
  {
    id: 29,
    nmcCode: "NMC-0001845",
    material: "Centrifugal Pump",
    cpse: "NTPC",
    price: 96500,
    unit: "Nos",
    status: "Normal",
  },
  {
    id: 30,
    nmcCode: "NMC-0001845",
    material: "Process Pump",
    cpse: "BHEL",
    price: 101200,
    unit: "Nos",
    status: "Normal",
  },
  {
    id: 31,
    nmcCode: "NMC-0001845",
    material: "Industrial Pump",
    cpse: "IOCL",
    price: 98700,
    unit: "Nos",
    status: "Normal",
  },
  {
    id: 32,
    nmcCode: "NMC-0001845",
    material: "Centrifugal Pump",
    cpse: "ONGC",
    price: 151000,
    unit: "Nos",
    status: "Anomaly",
  },

  // =====================================================
  // NMC-0001846 — Pressure Gauges
  // =====================================================
  {
    id: 33,
    nmcCode: "NMC-0001846",
    material: "Pressure Gauge",
    cpse: "CPCL",
    price: 3250,
    unit: "Nos",
    status: "Normal",
  },
  {
    id: 34,
    nmcCode: "NMC-0001846",
    material: "Pressure Gauge",
    cpse: "IOCL",
    price: 3400,
    unit: "Nos",
    status: "Normal",
  },
  {
    id: 35,
    nmcCode: "NMC-0001846",
    material: "Pressure Gauge",
    cpse: "BPCL",
    price: 3520,
    unit: "Nos",
    status: "Normal",
  },
  {
    id: 36,
    nmcCode: "NMC-0001846",
    material: "Pressure Gauge",
    cpse: "ONGC",
    price: 4900,
    unit: "Nos",
    status: "Anomaly",
  },
  {
    id: 37,
    nmcCode: "NMC-0001846",
    material: "Industrial Gauge",
    cpse: "CPCL",
    price: 4100,
    unit: "Nos",
    status: "Normal",
  },
  {
    id: 38,
    nmcCode: "NMC-0001846",
    material: "Pressure Gauge",
    cpse: "IOCL",
    price: 3750,
    unit: "Nos",
    status: "Normal",
  },
  {
    id: 39,
    nmcCode: "NMC-0001846",
    material: "Process Gauge",
    cpse: "BPCL",
    price: 4280,
    unit: "Nos",
    status: "Normal",
  },
  {
    id: 40,
    nmcCode: "NMC-0001846",
    material: "Pressure Gauge",
    cpse: "ONGC",
    price: 7200,
    unit: "Nos",
    status: "Anomaly",
  },
];

/* =========================================================
   PRICE ANOMALY PAGE
========================================================= */

function PriceAnomaly() {

  const [search, setSearch] =
    useState("");

  const [searchedValue, setSearchedValue] =
    useState("");

  const [cpseFilter, setCpseFilter] =
    useState("All CPSEs");

  const [materialFilter, setMaterialFilter] =
    useState("All Materials");

  const [anomalyFilter, setAnomalyFilter] =
    useState("All");

  const [selectedMaterial, setSelectedMaterial] =
    useState(null);


  /* =======================================================
     SEARCH
  ======================================================= */

  const handleSearch = () => {

    const value =
      search.trim().toUpperCase();

    setSearchedValue(value);

    setCpseFilter("All CPSEs");
    setMaterialFilter("All Materials");
    setAnomalyFilter("All");

  };


  const handleKeyDown = (event) => {

    if (event.key === "Enter") {
      handleSearch();
    }

  };


  /* =======================================================
     SEARCH MATCH
  ======================================================= */

  const searchedData = useMemo(() => {

    if (!searchedValue) {
      return priceData;
    }

    const searchLower =
      searchedValue.toLowerCase();

    return priceData.filter((item) =>

      item.nmcCode
        .toLowerCase()
        .includes(searchLower) ||

      item.material
        .toLowerCase()
        .includes(searchLower)

    );

  }, [searchedValue]);


  /* =======================================================
     ANOMALY CALCULATION
  ======================================================= */

  const dataWithAnomaly = useMemo(() => {

    const grouped = {};

    searchedData.forEach((item) => {

      const key =
        item.nmcCode;

      if (!grouped[key]) {
        grouped[key] = [];
      }

      grouped[key].push(item);

    });


    return searchedData.map((item) => {

      const group =
        grouped[item.nmcCode];

      const prices =
        group.map(
          (record) => record.price
        );

      const average =
        prices.reduce(
          (sum, price) =>
            sum + price,
          0
        ) / prices.length;


      const deviation =
        ((item.price - average) /
          average) *
        100;


      /*
        A price is considered anomalous
        when it differs from the average
        by more than 20%.
      */

      const isAnomaly =
        Math.abs(deviation) > 20;


      return {
        ...item,
        average,
        deviation,
        isAnomaly,
      };

    });

  }, [searchedData]);


  /* =======================================================
     FILTER OPTIONS
  ======================================================= */

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


  /* =======================================================
     FILTER + SORT
  ======================================================= */

  const filteredData = useMemo(() => {

    return dataWithAnomaly

      .filter((item) => {

        const cpseMatch =
          cpseFilter === "All CPSEs" ||
          item.cpse === cpseFilter;

        const materialMatch =
          materialFilter === "All Materials" ||
          item.material === materialFilter;

        const anomalyMatch =
          anomalyFilter === "All" ||
          (anomalyFilter === "Anomaly" &&
            item.isAnomaly) ||
          (anomalyFilter === "Normal" &&
            !item.isAnomaly);

        return (
          cpseMatch &&
          materialMatch &&
          anomalyMatch
        );

      })

      /* LOWEST PRICE → HIGHEST PRICE */
      .sort(
        (a, b) =>
          a.price - b.price
      );

  }, [
    dataWithAnomaly,
    cpseFilter,
    materialFilter,
    anomalyFilter,
  ]);


  /* =======================================================
     SUMMARY
  ======================================================= */

  const anomalyCount =
    filteredData.filter(
      (item) =>
        item.isAnomaly
    ).length;


  const lowestPrice =
    filteredData.length > 0
      ? filteredData[0].price
      : 0;


  const highestPrice =
    filteredData.length > 0
      ? filteredData[
          filteredData.length - 1
        ].price
      : 0;


  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  const clearFilters = () => {

    setCpseFilter("All CPSEs");
    setMaterialFilter("All Materials");
    setAnomalyFilter("All");

  };


  /* =======================================================
     FORMAT PRICE
  ======================================================= */

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


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="price-anomaly-page">


      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="price-page-header">

        <div>

          <div className="price-eyebrow">
            PROCUREMENT INTELLIGENCE
          </div>

          <h2>
            Price Anomaly Detection
          </h2>

          <p>
            Identify unusual material price
            variations across CPSEs.
          </p>

        </div>

      </div>


      {/* =================================================
          SEARCH
      ================================================= */}

      <section className="price-search-panel">

        <div className="price-panel-title">

          <Search size={18} />

          <div>

            <h3>
              Search Material Price
            </h3>

            <span>
              Search using an NMC code or
              material name.
            </span>

          </div>

        </div>


        <div className="price-search-row">

          <div className="price-search-input">

            <Search size={17} />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              onKeyDown={handleKeyDown}
              placeholder="Enter NMC code or material name..."
            />

          </div>


          <button
            className="price-search-button"
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

      <div className="price-summary-grid">

        <div className="price-summary-card">

          <div className="price-summary-icon">
            <Package size={18} />
          </div>

          <div>

            <span>
              PRICE RECORDS
            </span>

            <strong>
              {filteredData.length}
            </strong>

          </div>

        </div>


        <div className="price-summary-card anomaly-summary">

          <div className="price-summary-icon">
            <AlertTriangle size={18} />
          </div>

          <div>

            <span>
              ANOMALIES
            </span>

            <strong>
              {anomalyCount}
            </strong>

          </div>

        </div>


        <div className="price-summary-card">

          <div className="price-summary-icon">
            <TrendingUp size={18} />
          </div>

          <div>

            <span>
              LOWEST PRICE
            </span>

            <strong>
              {lowestPrice
                ? formatPrice(
                    lowestPrice
                  )
                : "—"}
            </strong>

          </div>

        </div>


        <div className="price-summary-card">

          <div className="price-summary-icon">
            <ArrowUpRight size={18} />
          </div>

          <div>

            <span>
              HIGHEST PRICE
            </span>

            <strong>
              {highestPrice
                ? formatPrice(
                    highestPrice
                  )
                : "—"}
            </strong>

          </div>

        </div>

      </div>


      {/* =================================================
          RESULTS
      ================================================= */}

      <section className="price-results-section">


        <div className="price-results-header">

          <div>

            <div className="price-result-label">
              PRICE ANALYSIS
            </div>

            <h3>
              Material Price Records
            </h3>

            <span>
              Prices are displayed from
              lowest to highest.
            </span>

          </div>

        </div>


        {/* =================================================
            FILTERS
        ================================================= */}

        <div className="price-filter-bar">

          <div className="price-filter-label">

            <Filter size={15} />

            <span>
              Filter Results
            </span>

          </div>


          {/* CPSE */}

          <div className="price-filter-control">

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

          <div className="price-filter-control">

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


          {/* ANOMALY */}

          <div className="price-filter-control">

            <AlertTriangle size={14} />

            <select
              value={anomalyFilter}
              onChange={(event) =>
                setAnomalyFilter(
                  event.target.value
                )
              }
            >

              <option value="All">
                All Status
              </option>

              <option value="Normal">
                Normal
              </option>

              <option value="Anomaly">
                Anomaly
              </option>

            </select>

          </div>


          <button
            className="price-clear-button"
            onClick={clearFilters}
          >

            <RotateCcw size={14} />

            Clear Filters

          </button>

        </div>


        {/* =================================================
            TABLE
        ================================================= */}

        {filteredData.length > 0 ? (

          <div className="price-table-container">

            <table className="price-table">

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
                    PRICE
                  </th>

                  <th>
                    AVERAGE
                  </th>

                  <th>
                    DEVIATION
                  </th>

                  <th>
                    STATUS
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredData.map(
                  (item, index) => (

                    <tr
                      key={`${item.nmcCode}-${item.cpse}-${index}`}
                      className={
                        item.isAnomaly
                          ? "price-anomaly-row"
                          : ""
                      }
                      onClick={() =>
                        setSelectedMaterial(
                          item
                        )
                      }
                    >

                      <td>

                        <span className="price-nmc-code">
                          {item.nmcCode}
                        </span>

                      </td>


                      <td>

                        <div className="price-material">

                          <Package size={15} />

                          <strong>
                            {item.material}
                          </strong>

                        </div>

                      </td>


                      <td>

                        <span className="price-cpse">
                          {item.cpse}
                        </span>

                      </td>


                      <td>

                        <strong className="price-value">
                          {formatPrice(
                            item.price
                          )}
                        </strong>

                      </td>


                      <td>

                        <span className="price-average">
                          {formatPrice(
                            item.average
                          )}
                        </span>

                      </td>


                      <td>

                        <span
                          className={
                            item.isAnomaly
                              ? "price-deviation anomaly"
                              : "price-deviation"
                          }
                        >
                          {item.deviation >= 0
                            ? "+"
                            : ""}
                          {item.deviation.toFixed(
                            1
                          )}
                          %
                        </span>

                      </td>


                      <td>

                        {item.isAnomaly ? (

                          <span className="price-status anomaly">
                            <AlertTriangle size={12} />
                            Anomaly
                          </span>

                        ) : (

                          <span className="price-status normal">
                            Normal
                          </span>

                        )}

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        ) : (

          <div className="price-empty-state">

            <AlertTriangle size={30} />

            <h3>
              No price records found
            </h3>

            <p>
              Try another NMC code, material,
              CPSE or filter combination.
            </p>

          </div>

        )}

      </section>


      {/* =================================================
          DETAIL PANEL
      ================================================= */}

      {selectedMaterial && (

        <div className="price-detail-overlay">

          <div className="price-detail-panel">


            <div className="price-detail-header">

              <div>

                <span>
                  PRICE RECORD
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


            <div className="price-detail-code">
              {selectedMaterial.nmcCode}
            </div>


            <div className="price-detail-grid">

              <div>
                <span>CPSE</span>
                <strong>
                  {selectedMaterial.cpse}
                </strong>
              </div>

              <div>
                <span>CATEGORY</span>
                <strong>
                  {selectedMaterial.category}
                </strong>
              </div>

              <div>
                <span>PRICE</span>
                <strong>
                  {formatPrice(
                    selectedMaterial.price
                  )}
                </strong>
              </div>

              <div>
                <span>AVERAGE PRICE</span>
                <strong>
                  {formatPrice(
                    selectedMaterial.average
                  )}
                </strong>
              </div>

            </div>


            <div
              className={
                selectedMaterial.isAnomaly
                  ? "price-detail-status anomaly"
                  : "price-detail-status normal"
              }
            >

              {selectedMaterial.isAnomaly ? (
                <>
                  <AlertTriangle size={18} />

                  <div>
                    <strong>
                      Price Anomaly Detected
                    </strong>

                    <span>
                      This price differs from
                      the calculated CPSE average
                      by{" "}
                      {Math.abs(
                        selectedMaterial.deviation
                      ).toFixed(1)}
                      %.
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <Package size={18} />

                  <div>
                    <strong>
                      Price Within Normal Range
                    </strong>

                    <span>
                      No significant price
                      deviation detected.
                    </span>
                  </div>
                </>
              )}

            </div>


            <button
              className="price-close-button"
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


export default PriceAnomaly;


