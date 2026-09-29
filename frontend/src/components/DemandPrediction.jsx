import { useEffect, useMemo, useState } from "react";

import {
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  Package,
  Building2,
  CalendarDays,
  BarChart3,
} from "lucide-react";

/* =========================================================
   DEMAND PREDICTION DEMO DATA
   TEMPORARY FRONTEND DATA
   Will later be replaced by backend prediction results.
========================================================= */

const demandData = [
  {
    materialCode: "MAT-0001842",
    material: "Industrial Control Valve",
    cpse: "ONGC",
    category: "Valves",
    uom: "Nos",
    currentDemand: 420,
    forecastDemand: 485,
    trend: "Increasing",
    confidence: 91,
    monthly: [
      320, 350, 365, 380, 395, 410,
      420, 435, 450, 462, 475, 485,
    ],
  },

  {
    materialCode: "MAT-0001843",
    material: "Carbon Steel Pipe",
    cpse: "BHEL",
    category: "Pipes",
    uom: "Meters",
    currentDemand: 680,
    forecastDemand: 620,
    trend: "Decreasing",
    confidence: 87,
    monthly: [
      720, 735, 710, 705, 695, 690,
      680, 665, 650, 640, 630, 620,
    ],
  },

  {
    materialCode: "MAT-0001844",
    material: "Bearing Assembly",
    cpse: "IOCL",
    category: "Mechanical",
    uom: "Nos",
    currentDemand: 310,
    forecastDemand: 355,
    trend: "Increasing",
    confidence: 89,
    monthly: [
      250, 265, 270, 280, 285, 295,
      310, 320, 330, 338, 347, 355,
    ],
  },

  {
    materialCode: "MAT-0001845",
    material: "Electrical Cable",
    cpse: "NTPC",
    category: "Electrical",
    uom: "Meters",
    currentDemand: 920,
    forecastDemand: 935,
    trend: "Stable",
    confidence: 94,
    monthly: [
      880, 895, 900, 910, 915, 925,
      920, 925, 930, 928, 932, 935,
    ],
  },

  {
    materialCode: "MAT-0001846",
    material: "Pressure Gauge",
    cpse: "GAIL",
    category: "Instrumentation",
    uom: "Nos",
    currentDemand: 185,
    forecastDemand: 225,
    trend: "Increasing",
    confidence: 86,
    monthly: [
      140, 150, 155, 160, 165, 175,
      185, 192, 200, 210, 218, 225,
    ],
  },

  {
    materialCode: "MAT-0001847",
    material: "Transformer Oil",
    cpse: "POWERGRID",
    category: "Electrical",
    uom: "Litres",
    currentDemand: 540,
    forecastDemand: 505,
    trend: "Decreasing",
    confidence: 83,
    monthly: [
      620, 610, 600, 590, 580, 565,
      540, 535, 525, 518, 510, 505,
    ],
  },

  {
    materialCode: "MAT-0001848",
    material: "Safety Helmet",
    cpse: "SAIL",
    category: "Safety",
    uom: "Nos",
    currentDemand: 260,
    forecastDemand: 275,
    trend: "Stable",
    confidence: 92,
    monthly: [
      240, 245, 250, 252, 255, 258,
      260, 263, 265, 268, 272, 275,
    ],
  },

  {
    materialCode: "MAT-0001849",
    material: "Hydraulic Pump",
    cpse: "HPCL",
    category: "Hydraulics",
    uom: "Nos",
    currentDemand: 145,
    forecastDemand: 190,
    trend: "Increasing",
    confidence: 84,
    monthly: [
      105, 112, 118, 120, 126, 135,
      145, 152, 160, 172, 181, 190,
    ],
  },

  {
    materialCode: "MAT-0001850",
    material: "Welding Electrode",
    cpse: "COAL India",
    category: "Welding",
    uom: "Kg",
    currentDemand: 760,
    forecastDemand: 815,
    trend: "Increasing",
    confidence: 88,
    monthly: [
      680, 695, 710, 720, 735, 748,
      760, 770, 782, 795, 805, 815,
    ],
  },

  {
    materialCode: "MAT-0001851",
    material: "Lubricating Oil",
    cpse: "ONGC",
    category: "Lubricants",
    uom: "Litres",
    currentDemand: 610,
    forecastDemand: 590,
    trend: "Decreasing",
    confidence: 85,
    monthly: [
      670, 660, 650, 640, 630, 620,
      610, 608, 605, 600, 595, 590,
    ],
  },

  {
    materialCode: "MAT-0001852",
    material: "Industrial Motor",
    cpse: "BHEL",
    category: "Electrical",
    uom: "Nos",
    currentDemand: 210,
    forecastDemand: 245,
    trend: "Increasing",
    confidence: 90,
    monthly: [
      165, 175, 180, 185, 190, 200,
      210, 218, 225, 232, 239, 245,
    ],
  },

  {
    materialCode: "MAT-0001853",
    material: "Fire Extinguisher",
    cpse: "IOCL",
    category: "Safety",
    uom: "Nos",
    currentDemand: 195,
    forecastDemand: 180,
    trend: "Decreasing",
    confidence: 82,
    monthly: [
      230, 225, 220, 215, 210, 205,
      195, 193, 190, 187, 184, 180,
    ],
  },

  {
    materialCode: "MAT-0001854",
    material: "Steam Trap",
    cpse: "ONGC",
    category: "Valves",
    uom: "Nos",
    currentDemand: 330,
    forecastDemand: 370,
    trend: "Increasing",
    confidence: 88,
    monthly: [
      270, 280, 290, 300, 310, 320,
      330, 340, 350, 358, 365, 370,
    ],
  },

  {
    materialCode: "MAT-0001855",
    material: "Mild Steel Pipe",
    cpse: "BHEL",
    category: "Pipes",
    uom: "Meters",
    currentDemand: 590,
    forecastDemand: 565,
    trend: "Decreasing",
    confidence: 86,
    monthly: [
      640, 635, 625, 620, 610, 600,
      590, 585, 580, 575, 570, 565,
    ],
  },

  {
    materialCode: "MAT-0001856",
    material: "Roller Bearing",
    cpse: "IOCL",
    category: "Mechanical",
    uom: "Nos",
    currentDemand: 275,
    forecastDemand: 315,
    trend: "Increasing",
    confidence: 90,
    monthly: [
      220, 230, 240, 245, 255, 265,
      275, 285, 292, 300, 308, 315,
    ],
  },

  {
    materialCode: "MAT-0001857",
    material: "Power Cable",
    cpse: "NTPC",
    category: "Electrical",
    uom: "Meters",
    currentDemand: 810,
    forecastDemand: 830,
    trend: "Stable",
    confidence: 93,
    monthly: [
      780, 790, 795, 800, 805, 808,
      810, 815, 818, 822, 826, 830,
    ],
  },

  {
    materialCode: "MAT-0001858",
    material: "Temperature Gauge",
    cpse: "GAIL",
    category: "Instrumentation",
    uom: "Nos",
    currentDemand: 165,
    forecastDemand: 205,
    trend: "Increasing",
    confidence: 85,
    monthly: [
      125, 132, 138, 142, 148, 155,
      165, 172, 180, 188, 196, 205,
    ],
  },

  {
    materialCode: "MAT-0001859",
    material: "Insulating Oil",
    cpse: "POWERGRID",
    category: "Electrical",
    uom: "Litres",
    currentDemand: 480,
    forecastDemand: 450,
    trend: "Decreasing",
    confidence: 84,
    monthly: [
      550, 540, 530, 520, 510, 495,
      480, 475, 470, 462, 456, 450,
    ],
  },

  {
    materialCode: "MAT-0001860",
    material: "Safety Gloves",
    cpse: "SAIL",
    category: "Safety",
    uom: "Pairs",
    currentDemand: 420,
    forecastDemand: 455,
    trend: "Increasing",
    confidence: 91,
    monthly: [
      350, 360, 370, 380, 390, 405,
      420, 428, 435, 442, 450, 455,
    ],
  },

  {
    materialCode: "MAT-0001861",
    material: "Hydraulic Cylinder",
    cpse: "HPCL",
    category: "Hydraulics",
    uom: "Nos",
    currentDemand: 125,
    forecastDemand: 160,
    trend: "Increasing",
    confidence: 83,
    monthly: [
      90, 95, 100, 105, 112, 118,
      125, 132, 140, 147, 153, 160,
    ],
  },

  {
    materialCode: "MAT-0001862",
    material: "Welding Wire",
    cpse: "COAL India",
    category: "Welding",
    uom: "Kg",
    currentDemand: 690,
    forecastDemand: 735,
    trend: "Increasing",
    confidence: 89,
    monthly: [
      600, 615, 625, 635, 650, 670,
      690, 700, 710, 720, 728, 735,
    ],
  },
];

/* =========================================================
   MONTHS
========================================================= */

const months = [
  "Oct",
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
];

/* =========================================================
   COMPONENT
========================================================= */

function DemandPrediction() {
  const [search, setSearch] = useState("");

  const [selectedCPSE, setSelectedCPSE] =
    useState("All CPSEs");

  const [selectedCategory, setSelectedCategory] =
    useState("All Categories");

  const [forecastPeriod, setForecastPeriod] =
    useState("6 Months");

  const [selectedMaterial, setSelectedMaterial] =
    useState(demandData[0]);

  /* =========================================================
     CPSE OPTIONS
  ========================================================= */

  const cpseOptions = useMemo(() => {
    return [
      "All CPSEs",
      ...new Set(
        demandData.map((item) => item.cpse)
      ),
    ];
  }, []);

  /* =========================================================
     CATEGORY OPTIONS
  ========================================================= */

  const categoryOptions = useMemo(() => {
    return [
      "All Categories",
      ...new Set(
        demandData.map((item) => item.category)
      ),
    ];
  }, []);

  /* =========================================================
     FILTER DATA
  ========================================================= */

  const filteredData = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return demandData.filter((item) => {
      const matchesSearch =
        !query ||
        item.materialCode
          .toLowerCase()
          .includes(query) ||
        item.material
          .toLowerCase()
          .includes(query) ||
        item.cpse
          .toLowerCase()
          .includes(query);

      const matchesCPSE =
        selectedCPSE === "All CPSEs" ||
        item.cpse === selectedCPSE;

      const matchesCategory =
        selectedCategory ===
          "All Categories" ||
        item.category ===
          selectedCategory;

      return (
        matchesSearch &&
        matchesCPSE &&
        matchesCategory
      );
    });
  }, [
    search,
    selectedCPSE,
    selectedCategory,
  ]);

  /* =========================================================
     KEEP SELECTED MATERIAL VALID
  ========================================================= */

  useEffect(() => {
    if (filteredData.length === 0) {
      setSelectedMaterial(null);
      return;
    }

    const selectedStillExists =
      filteredData.some(
        (item) =>
          item.materialCode ===
          selectedMaterial?.materialCode
      );

    if (!selectedStillExists) {
      setSelectedMaterial(
        filteredData[0]
      );
    }
  }, [
    filteredData,
    selectedMaterial,
  ]);

  /* =========================================================
     SUMMARY
  ========================================================= */

  const summary = useMemo(() => {
    const totalCurrent =
      filteredData.reduce(
        (sum, item) =>
          sum + item.currentDemand,
        0
      );

    const totalForecast =
      filteredData.reduce(
        (sum, item) =>
          sum + item.forecastDemand,
        0
      );

    const increasing =
      filteredData.filter(
        (item) =>
          item.trend === "Increasing"
      ).length;

    const decreasing =
      filteredData.filter(
        (item) =>
          item.trend === "Decreasing"
      ).length;

    return {
      totalCurrent,
      totalForecast,
      increasing,
      decreasing,
    };
  }, [filteredData]);

  /* =========================================================
     OVERALL CHANGE
  ========================================================= */

  const changePercentage =
    summary.totalCurrent === 0
      ? 0
      : (
          (
            summary.totalForecast -
            summary.totalCurrent
          ) /
          summary.totalCurrent
        ) *
        100;

  /* =========================================================
     TREND ICON
  ========================================================= */

  const getTrendIcon = (trend) => {
    if (trend === "Increasing") {
      return <TrendingUp size={15} />;
    }

    if (trend === "Decreasing") {
      return <TrendingDown size={15} />;
    }

    return <Minus size={15} />;
  };

  /* =========================================================
     TREND CLASS
  ========================================================= */

  const getTrendClass = (trend) => {
    if (trend === "Increasing") {
      return "increasing";
    }

    if (trend === "Decreasing") {
      return "decreasing";
    }

    return "stable";
  };

  /* =========================================================
     SELECTED MATERIAL MAX VALUE
  ========================================================= */

  const chartMax = selectedMaterial
    ? Math.max(
        ...selectedMaterial.monthly,
        800
      )
    : 800;

  /* =========================================================
     FORECAST START
  ========================================================= */

  const forecastStartIndex = 6;

  /* =========================================================
     DISPLAY MONTH COUNT
  ========================================================= */

  let visibleMonthCount = 12;

  if (forecastPeriod === "3 Months") {
    visibleMonthCount = 9;
  }

  if (forecastPeriod === "6 Months") {
    visibleMonthCount = 12;
  }

  if (forecastPeriod === "12 Months") {
    visibleMonthCount = 12;
  }

  const visibleMonths =
    months.slice(0, visibleMonthCount);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="demand-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="demand-header">

        <div>

          <div className="demand-eyebrow">
            CPSE MATERIAL INTELLIGENCE
          </div>

          <h1>
            Demand Prediction
          </h1>

          <p>
            Forecast future material demand
            using historical consumption
            patterns across CPSEs.
          </p>

        </div>

        <div className="demand-header-status">

          <BarChart3 size={17} />

          <span>
            Forecasting Module
          </span>

        </div>

      </div>


      {/* =====================================================
          FILTER BAR
      ===================================================== */}

      <section className="demand-filter-panel">

        {/* SEARCH */}

        <div className="demand-filter search-filter">

          <label>
            Search Material
          </label>

          <div className="demand-search-box">

            <Search size={17} />

            <input
              type="text"
              placeholder="Material code, name or CPSE..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>

        </div>


        {/* CPSE */}

        <div className="demand-filter">

          <label>
            CPSE
          </label>

          <select
            value={selectedCPSE}
            onChange={(event) =>
              setSelectedCPSE(
                event.target.value
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

        </div>


        {/* CATEGORY */}

        <div className="demand-filter">

          <label>
            Category
          </label>

          <select
            value={selectedCategory}
            onChange={(event) =>
              setSelectedCategory(
                event.target.value
              )
            }
          >

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

        </div>


        {/* FORECAST PERIOD */}

        <div className="demand-filter">

          <label>
            Forecast Period
          </label>

          <select
            value={forecastPeriod}
            onChange={(event) =>
              setForecastPeriod(
                event.target.value
              )
            }
          >

            <option>
              3 Months
            </option>

            <option>
              6 Months
            </option>

            <option>
              12 Months
            </option>

          </select>

        </div>

      </section>


      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <section className="demand-summary">

        <div className="demand-summary-card">

          <div className="demand-summary-icon blue">
            <Package size={19} />
          </div>

          <div>

            <span>
              Current Demand
            </span>

            <strong>
              {summary.totalCurrent.toLocaleString()}
            </strong>

            <small>
              Across filtered materials
            </small>

          </div>

        </div>


        <div className="demand-summary-card">

          <div className="demand-summary-icon purple">
            <TrendingUp size={19} />
          </div>

          <div>

            <span>
              Forecast Demand
            </span>

            <strong>
              {summary.totalForecast.toLocaleString()}
            </strong>

            <small>
              {forecastPeriod} outlook
            </small>

          </div>

        </div>


        <div className="demand-summary-card">

          <div className="demand-summary-icon green">
            <TrendingUp size={19} />
          </div>

          <div>

            <span>
              Increasing Demand
            </span>

            <strong>
              {summary.increasing}
            </strong>

            <small>
              Materials showing growth
            </small>

          </div>

        </div>


        <div className="demand-summary-card">

          <div className="demand-summary-icon orange">
            <TrendingDown size={19} />
          </div>

          <div>

            <span>
              Demand Reduction
            </span>

            <strong>
              {summary.decreasing}
            </strong>

            <small>
              Materials showing decline
            </small>

          </div>

        </div>

      </section>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="demand-content-grid">


        {/* ===================================================
            CHART
        =================================================== */}

        <section className="demand-chart-panel">

          <div className="demand-section-header">

            <div>

              <h2>
                Demand Forecast
              </h2>

              <p>
                Historical demand and projected
                material requirement
              </p>

            </div>

            <div className="demand-selected-material">

              <Package size={15} />

              <span>
                {selectedMaterial?.materialCode ||
                  "No material selected"}
              </span>

            </div>

          </div>


          {selectedMaterial ? (

            <>

              <div className="demand-chart">

                <div className="chart-y-axis">

                  <span>
                    {Math.round(chartMax)}
                  </span>

                  <span>
                    {Math.round(
                      chartMax * 0.75
                    )}
                  </span>

                  <span>
                    {Math.round(
                      chartMax * 0.5
                    )}
                  </span>

                  <span>
                    {Math.round(
                      chartMax * 0.25
                    )}
                  </span>

                  <span>
                    0
                  </span>

                </div>


                <div className="chart-area">

                  <div className="chart-grid-line line-1" />
                  <div className="chart-grid-line line-2" />
                  <div className="chart-grid-line line-3" />
                  <div className="chart-grid-line line-4" />
                  <div className="chart-grid-line line-5" />


                  <div className="demand-bars">

                    {selectedMaterial.monthly
                      .slice(
                        0,
                        visibleMonthCount
                      )
                      .map(
                        (
                          value,
                          index
                        ) => {

                          const height =
                            Math.max(
                              8,
                              (
                                value /
                                chartMax
                              ) *
                                100
                            );

                          const isForecast =
                            index >=
                            forecastStartIndex;

                          return (
                            <div
                              className="demand-bar-column"
                              key={`${selectedMaterial.materialCode}-${months[index]}`}
                            >

                              <div className="demand-bar-value">
                                {value}
                              </div>

                              <div
                                className={`demand-bar ${
                                  isForecast
                                    ? "forecast"
                                    : "historical"
                                }`}
                                style={{
                                  height:
                                    `${height}%`,
                                }}
                              />

                              <span>
                                {months[index]}
                              </span>

                            </div>
                          );
                        }
                      )}

                  </div>

                </div>

              </div>


              {/* LEGEND */}

              <div className="demand-chart-legend">

                <div>

                  <span className="legend-box historical" />

                  Historical Demand

                </div>

                <div>

                  <span className="legend-box forecast" />

                  Forecast Demand

                </div>

                <div className="forecast-period-label">

                  <CalendarDays size={14} />

                  {forecastPeriod}

                </div>

              </div>

            </>

          ) : (

            <div className="demand-empty">

              <Package size={28} />

              <h3>
                No material selected
              </h3>

              <p>
                Try changing the search or
                filter options.
              </p>

            </div>

          )}

        </section>


        {/* ===================================================
            FORECAST DETAILS
        =================================================== */}

        <section className="demand-detail-panel">

          <div className="demand-section-header">

            <div>

              <h2>
                Forecast Summary
              </h2>

              <p>
                Selected material
              </p>

            </div>

          </div>


          {selectedMaterial ? (

            <>

              {/* MATERIAL */}

              <div className="demand-material-name">

                <div className="material-icon">

                  <Package size={20} />

                </div>

                <div>

                  <strong>
                    {selectedMaterial.material}
                  </strong>

                  <span>
                    {selectedMaterial.materialCode}
                  </span>

                </div>

              </div>


              {/* CPSE */}

              <div className="demand-detail-row">

                <span>
                  CPSE
                </span>

                <strong>

                  <Building2 size={14} />

                  {selectedMaterial.cpse}

                </strong>

              </div>


              {/* CATEGORY */}

              <div className="demand-detail-row">

                <span>
                  Category
                </span>

                <strong>
                  {selectedMaterial.category}
                </strong>

              </div>


              {/* UNIT */}

              <div className="demand-detail-row">

                <span>
                  Unit
                </span>

                <strong>
                  {selectedMaterial.uom}
                </strong>

              </div>


              {/* CURRENT VS FORECAST */}

              <div className="demand-metric-box">

                <div>

                  <span>
                    Current Demand
                  </span>

                  <strong>
                    {selectedMaterial.currentDemand.toLocaleString()}
                  </strong>

                  <small>
                    {selectedMaterial.uom}
                  </small>

                </div>


                <div className="metric-arrow">
                  →
                </div>


                <div>

                  <span>
                    Forecast
                  </span>

                  <strong>
                    {selectedMaterial.forecastDemand.toLocaleString()}
                  </strong>

                  <small>
                    {selectedMaterial.uom}
                  </small>

                </div>

              </div>


              {/* TREND */}

              <div
                className={`demand-trend-box ${getTrendClass(
                  selectedMaterial.trend
                )}`}
              >

                {getTrendIcon(
                  selectedMaterial.trend
                )}

                <div>

                  <span>
                    Expected Trend
                  </span>

                  <strong>
                    {selectedMaterial.trend}
                  </strong>

                </div>

                <b>

                  {(
                    (
                      (
                        selectedMaterial.forecastDemand -
                        selectedMaterial.currentDemand
                      ) /
                      selectedMaterial.currentDemand
                    ) *
                    100
                  ).toFixed(1)}
                  %

                </b>

              </div>


              {/* CONFIDENCE */}

              <div className="demand-confidence">

                <div>

                  <span>
                    Forecast Confidence
                  </span>

                  <strong>
                    {selectedMaterial.confidence}%
                  </strong>

                </div>


                <div className="confidence-track">

                  <div
                    style={{
                      width:
                        `${selectedMaterial.confidence}%`,
                    }}
                  />

                </div>

              </div>

            </>

          ) : (

            <div className="demand-empty">

              <Package size={28} />

              <h3>
                No matching material
              </h3>

              <p>
                Change your search or
                filters to view forecast
                details.
              </p>

            </div>

          )}

        </section>

      </div>


      {/* =====================================================
          TABLE
      ===================================================== */}

      <section className="demand-table-panel">

        <div className="demand-table-header">

          <div>

            <h2>
              Material Demand Forecast
            </h2>

            <p>

              {filteredData.length} material
              records matching current
              filters

            </p>

          </div>


          <div className="demand-overall-change">

            Overall change:

            <strong
              className={
                changePercentage >= 0
                  ? "positive"
                  : "negative"
              }
            >

              {changePercentage >= 0
                ? "+"
                : ""}

              {changePercentage.toFixed(1)}%

            </strong>

          </div>

        </div>


        <div className="demand-table-wrapper">

          <table className="demand-table">

            <thead>

              <tr>

                <th>
                  Material Code
                </th>

                <th>
                  Material
                </th>

                <th>
                  CPSE
                </th>

                <th>
                  Category
                </th>

                <th>
                  Current Demand
                </th>

                <th>
                  Forecast
                </th>

                <th>
                  Trend
                </th>

                <th>
                  Confidence
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredData.map(
                (item) => (

                  <tr
                    key={item.materialCode}
                    className={
                      selectedMaterial?.materialCode ===
                      item.materialCode
                        ? "selected-row"
                        : ""
                    }
                    onClick={() =>
                      setSelectedMaterial(
                        item
                      )
                    }
                  >

                    {/* MATERIAL CODE */}

                    <td>

                      <span className="material-code">

                        {item.materialCode}

                      </span>

                    </td>


                    {/* MATERIAL */}

                    <td>

                      <div className="table-material">

                        <strong>
                          {item.material}
                        </strong>

                        <span>
                          {item.uom}
                        </span>

                      </div>

                    </td>


                    {/* CPSE */}

                    <td>

                      <span className="cpse-cell">

                        {item.cpse}

                      </span>

                    </td>


                    {/* CATEGORY */}

                    <td>

                      {item.category}

                    </td>


                    {/* CURRENT */}

                    <td>

                      {item.currentDemand.toLocaleString()}

                    </td>


                    {/* FORECAST */}

                    <td>

                      <strong>

                        {item.forecastDemand.toLocaleString()}

                      </strong>

                    </td>


                    {/* TREND */}

                    <td>

                      <span
                        className={`demand-trend ${getTrendClass(
                          item.trend
                        )}`}
                      >

                        {getTrendIcon(
                          item.trend
                        )}

                        {item.trend}

                      </span>

                    </td>


                    {/* CONFIDENCE */}

                    <td>

                      <div className="table-confidence">

                        <span>
                          {item.confidence}%
                        </span>

                        <div>

                          <i
                            style={{
                              width:
                                `${item.confidence}%`,
                            }}
                          />

                        </div>

                      </div>

                    </td>

                  </tr>

                )
              )}


              {/* NO RESULTS */}

              {filteredData.length === 0 && (

                <tr>

                  <td colSpan="8">

                    <div className="demand-empty">

                      <Search size={28} />

                      <h3>
                        No demand records found
                      </h3>

                      <p>
                        Try another material,
                        CPSE or category.
                      </p>

                    </div>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </section>

    </div>
  );
}

export default DemandPrediction;