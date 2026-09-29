
import { useEffect, useMemo, useState } from "react";

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

import { getSampleMaterials } from "./api";


/* =========================================================
   PRICE ANOMALY PAGE
========================================================= */

function PriceAnomaly() {

  const [priceData, setPriceData] = useState([]);

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

  const [anomalyFilter, setAnomalyFilter] =
    useState("All");

  const [selectedMaterial, setSelectedMaterial] =
    useState(null);


  /* =======================================================
     LOAD BACKEND DATA
  ======================================================= */

  useEffect(() => {

    getSampleMaterials()

      .then((data) => {

        const materials =
          data.materials || [];

        const formattedMaterials =
          materials.map((item, index) => ({

            id:
              item.material_id ||
              index + 1,

            materialCode:
              item.material_code ||
              "—",

            material:
              item.material_description ||
              "Unknown Material",

            cpse:
              item.cpse_code ||
              "—",

            cpseName:
              item.cpse_name ||
              "—",

            price:
              Number(
                item.procurement_price_inr
              ) || 0,

            unit:
              item.uom ||
              "—",

            category:
              item.category ||
              "—",

            specification:
              item.specification ||
              "—",

            unspsc:
              item.unspsc_code ||
              "—",

          }));


        setPriceData(
          formattedMaterials
        );

        setLoading(false);

      })

      .catch((err) => {

        console.error(
          "Backend error:",
          err
        );

        setError(
          "Unable to load price data from backend."
        );

        setLoading(false);

      });

  }, []);


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

      item.materialCode
        .toLowerCase()
        .includes(searchLower) ||

      item.material
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
    priceData,
  ]);


  /* =======================================================
     ANOMALY CALCULATION
  ======================================================= */

  const dataWithAnomaly = useMemo(() => {

    /*
      Group materials by material category.

      Since the backend does not currently provide
      an NMC code, we use category as the comparison
      group for price analysis.
    */

    const grouped = {};


    searchedData.forEach((item) => {

      const key =
        item.category ||
        item.material;


      if (!grouped[key]) {
        grouped[key] = [];
      }

      grouped[key].push(item);

    });


    return searchedData.map((item) => {

      const key =
        item.category ||
        item.material;

      const group =
        grouped[key] || [item];


      const prices =
        group
          .map(
            (record) =>
              Number(record.price) || 0
          )
          .filter(
            (price) => price > 0
          );


      const average =
        prices.length > 0
          ? prices.reduce(
              (sum, price) =>
                sum + price,
              0
            ) / prices.length
          : 0;


      const deviation =
        average > 0
          ? ((item.price - average) /
              average) *
            100
          : 0;


      /*
        A price is considered anomalous
        when it differs from the group
        average by more than 20%.
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

          (
            anomalyFilter === "Anomaly" &&
            item.isAnomaly
          ) ||

          (
            anomalyFilter === "Normal" &&
            !item.isAnomaly
          );


        return (
          cpseMatch &&
          materialMatch &&
          anomalyMatch
        );

      })

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
     LOADING
  ======================================================= */

  if (loading) {

    return (
      <div className="price-anomaly-page">

        <div className="price-page-header">

          <div>

            <div className="price-eyebrow">
              PROCUREMENT INTELLIGENCE
            </div>

            <h2>
              Price Anomaly Detection
            </h2>

            <p>
              Loading material price records...
            </p>

          </div>

        </div>

      </div>
    );

  }


  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {

    return (
      <div className="price-anomaly-page">

        <div className="price-page-header">

          <div>

            <div className="price-eyebrow">
              PROCUREMENT INTELLIGENCE
            </div>

            <h2>
              Price Anomaly Detection
            </h2>

            <p>
              {error}
            </p>

          </div>

        </div>

      </div>
    );

  }


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
              Search using a material code,
              material name or CPSE.
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
              placeholder="Enter material code, material name or CPSE..."
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
                    MATERIAL CODE
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
                      key={`${item.materialCode}-${item.cpse}-${index}`}
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
                          {item.materialCode}
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
              Try another material code,
              material, CPSE or filter
              combination.
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

              {selectedMaterial.materialCode}

            </div>


            <div className="price-detail-grid">

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
                  AVERAGE PRICE
                </span>

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
                      the calculated comparison
                      average by{" "}

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
