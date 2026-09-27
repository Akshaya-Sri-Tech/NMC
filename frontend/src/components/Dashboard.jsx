import { useEffect, useMemo, useRef, useState } from "react";

import {
  Search,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  Building2,
  Hash,
  Clock3,
} from "lucide-react";

import { cpseData } from "../data/cpseData";

function Dashboard({
  setActivePage,
  globalSearch,
  setGlobalSearch,
  globalSearchTrigger
}) {
  const dashboardRef = useRef(null);

  const [companySearch, setCompanySearch] = useState("");
  const [nmcSearch, setNmcSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedNMC, setSelectedNMC] = useState(null);

  /* =====================================================
     DASHBOARD DATA
  ===================================================== */

  const stats = {
    totalMaterials: 842000,
    standardized: 687000,
    pending: 12480,
    humanCheck: 3240,
  };

  /* =====================================================
     STANDARDIZATION PROGRESS
  ===================================================== */

  const standardizationPercentage =
    (stats.standardized / stats.totalMaterials) * 100;

  const remainingMaterials =
    stats.totalMaterials - stats.standardized;

  /* =====================================================
     PENDING TREND - LAST 7 DAYS
  ===================================================== */

  const pendingTrendData = [
    { day: "Mon", value: 10840 },
    { day: "Tue", value: 11260 },
    { day: "Wed", value: 10920 },
    { day: "Thu", value: 11780 },
    { day: "Fri", value: 12140 },
    { day: "Sat", value: 11920 },
    { day: "Sun", value: stats.pending },
  ];

  const maxPendingTrend = Math.max(
    ...pendingTrendData.map((item) => item.value)
  );

  const minPendingTrend = Math.min(
    ...pendingTrendData.map((item) => item.value)
  );

  /* =====================================================
     PENDING TASKS BY CPSE
  ===================================================== */

  const cpsePendingData = [
    { name: "ONGC", value: 3120, color: "#9cc9e8" },
    { name: "BHEL", value: 2480, color: "#a9d7a7" },
    { name: "NTPC", value: 2210, color: "#f0c78f" },
    { name: "IOCL", value: 1960, color: "#e8a8bf" },
    { name: "BPCL", value: 1510, color: "#b9a9e6" },
    { name: "SAIL", value: 1200, color: "#8accc2" },
  ];

  const maxCpsePending = Math.max(
    ...cpsePendingData.map((item) => item.value)
  );

  const highestPendingCPSE = cpsePendingData.reduce(
    (highest, item) =>
      item.value > highest.value ? item : highest,
    cpsePendingData[0]
  );

  /* =====================================================
     CPSE / COMPANY SEARCH
  ===================================================== */

  const companyResults = useMemo(() => {
    if (!companySearch.trim()) return [];

    const query = companySearch.toLowerCase();

    return cpseData
      .filter(
        (cpse) =>
          cpse.name?.toLowerCase().includes(query) ||
          cpse.shortName?.toLowerCase().includes(query) ||
          cpse.city?.toLowerCase().includes(query) ||
          cpse.state?.toLowerCase().includes(query)
      )
      .slice(0, 5);
  }, [companySearch]);

  /* =====================================================
     NMC CODE SEARCH
  ===================================================== */

  const demoNMC = [
    {
      code: "NMC-0001842",
      description: "Ball Bearing 6205",
      category: "Mechanical",
      cpse: "IOCL",
    },
    {
      code: "NMC-0001843",
      description: "Carbon Steel Pipe",
      category: "Pipeline",
      cpse: "ONGC",
    },
    {
      code: "NMC-0001844",
      description: "Industrial Valve",
      category: "Mechanical",
      cpse: "BPCL",
    },
    {
      code: "NMC-0001845",
      description: "Copper Cable",
      category: "Electrical",
      cpse: "NTPC",
    },
    {
      code: "NMC-0001846",
      description: "Pressure Gauge",
      category: "Instrumentation",
      cpse: "CPCL",
    },
  ];

  const nmcResults = useMemo(() => {
    if (!nmcSearch.trim()) return [];

    const query = nmcSearch.toLowerCase();

    return demoNMC.filter(
      (item) =>
        item.code.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    );
  }, [nmcSearch]);

    
    /* =====================================================
     GLOBAL SEARCH → DASHBOARD SEARCH
  ===================================================== */

   useEffect(() => {
  if (
    !globalSearch?.trim() ||
    globalSearchTrigger === 0
  ) {
    return;
  }

  const searchValue = globalSearch.trim();

  const isNMC =
    searchValue.toUpperCase().startsWith("NMC-");

  if (isNMC) {
    setNmcSearch(searchValue);
    setCompanySearch("");
  } else {
    setCompanySearch(searchValue);
    setNmcSearch("");
  }

  setTimeout(() => {
  const searchSection =
    document.getElementById(
      "dashboard-search-section"
    );

  if (searchSection) {
    const topbarOffset = 90;

    const elementPosition =
      searchSection.getBoundingClientRect().top;

    const offsetPosition =
      elementPosition +
      window.scrollY -
      topbarOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  }
}, 150);
}, [globalSearchTrigger]);

  /* =====================================================
     SCROLL ANIMATION
  ===================================================== */

  useEffect(() => {
    const dashboard = dashboardRef.current;

    if (!dashboard) {
      return undefined;
    }

    const textElements = dashboard.querySelectorAll(
      "h2, h3, h4, p, span, strong, small, button, .cpse-pending-card"
    );

    textElements.forEach((element) => {
      element.classList.add("scroll-float");
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("scroll-float-visible");
          } else {
            entry.target.classList.remove(
              "scroll-float-visible"
            );
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -35px",
      }
    );

    textElements.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      className="dashboard-page"
      ref={dashboardRef}
    >

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="dashboard-header">

        <div>

          <div className="eyebrow">
            CPSE MATERIAL INTELLIGENCE
          </div>

          <h2 className="typing-title">
            Dashboard
          </h2>

          <p>
            Monitor material standardization,
            validation and cross-CPSE activity.
          </p>

        </div>


        {/* HEADER ACTIONS */}

        <div className="dashboard-header-actions">

          <button
            className="header-action-button pending"
            onClick={() =>
              setActivePage("Pending")
            }
          >

            <AlertTriangle size={17} />

            <span>
              Pending
            </span>

            <strong>
              {formatNumber(stats.pending)}
            </strong>

            <ArrowRight size={15} />

          </button>


          <button
            className="header-action-button human"
            onClick={() =>
              setActivePage("Human Check")
            }
          >

            <UserCheck size={17} />

            <span>
              Human Check
            </span>

            <strong>
              {formatNumber(stats.humanCheck)}
            </strong>

            <ArrowRight size={15} />

          </button>

        </div>

      </div>


      {/* =================================================
          PENDING TASKS BY CPSE
      ================================================= */}

      <section className="dashboard-section">

  <div className="section-heading">

    <div>

      <h3>
        Search
      </h3>

            <span>
              Pending material records requiring
              processing across connected CPSEs
            </span>

          </div>

        </div>


        <div className="cpse-pending-card">

          <div className="cpse-pending-chart">

            {/* =================================================
                BAR GRAPH
            ================================================= */}

            <div className="cpse-chart-area">

              {/* Y AXIS */}

              <div className="cpse-y-axis">

                <span>
                  {formatNumber(
                    maxCpsePending
                  )}
                </span>

                <span>
                  {formatNumber(
                    Math.round(
                      maxCpsePending * 0.75
                    )
                  )}
                </span>

                <span>
                  {formatNumber(
                    Math.round(
                      maxCpsePending * 0.5
                    )
                  )}
                </span>

                <span>
                  {formatNumber(
                    Math.round(
                      maxCpsePending * 0.25
                    )
                  )}
                </span>

                <span>
                  0
                </span>

              </div>


              {/* GRAPH */}

              <div className="cpse-chart-main">

                <div className="cpse-grid-lines">

                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>

                </div>


                {/* BARS */}

                <div className="cpse-bars">

                  {cpsePendingData.map(
                    (item) => {

                      const height =
                        (item.value /
                          maxCpsePending) *
                        100;

                      return (
                        <div
                          className="cpse-bar-column"
                          key={item.name}
                        >

                          <div className="cpse-bar-value">
                            {formatNumber(
                              item.value
                            )}
                          </div>


                          <div className="cpse-bar-wrapper">

                            <div
                              className="cpse-bar"
                              style={{
                                height: `${height}%`,
                                background:
                                  item.color,
                                borderColor:
                                  item.color,
                                boxShadow:
                                  `inset 0 0 0 1px ${item.color}`,
                              }}
                            />

                          </div>


                          <div className="cpse-bar-label">
                            {item.name}
                          </div>

                        </div>
                      );
                    }
                  )}

                </div>


                <div className="cpse-x-axis"></div>

              </div>

            </div>


            {/* =================================================
                NEW CPSE ANALYTICS SUMMARY
            ================================================= */}

            <div className="cpse-total-panel">

              {/* TOTAL PENDING */}

              <div className="cpse-summary-total">

                <div className="cpse-summary-total-top">

                  <div>
                    <span>
                      TOTAL PENDING
                    </span>

                    <small>
                      Current workload
                    </small>
                  </div>

                  <div className="cpse-summary-total-icon">
                    <Clock3 size={18} />
                  </div>

                </div>

                <strong>
                  {formatNumber(stats.pending)}
                </strong>

                <div className="cpse-summary-total-footer">

                  <span>
                    Across monitored CPSEs
                  </span>

                  <span className="cpse-summary-live">
                    <i></i>
                    Live
                  </span>

                </div>

              </div>


              {/* SUMMARY METRICS */}

              <div className="cpse-summary-metrics">

                <div className="cpse-summary-metric">

                  <div className="cpse-summary-metric-top">

                    <span>
                      Standardized
                    </span>

                    <CheckCircle2 size={15} />

                  </div>

                  <strong>
                    {formatNumber(
                      stats.standardized
                    )}
                  </strong>

                  <div className="cpse-mini-progress">

                    <div
                      style={{
                        width: `${standardizationPercentage}%`,
                      }}
                    />

                  </div>

                </div>


                <div className="cpse-summary-metric">

                  <div className="cpse-summary-metric-top">

                    <span>
                      Human Check
                    </span>

                    <UserCheck size={15} />

                  </div>

                  <strong>
                    {formatNumber(
                      stats.humanCheck
                    )}
                  </strong>

                  <small>
                    Awaiting validation
                  </small>

                </div>


                <div className="cpse-summary-metric">

                  <div className="cpse-summary-metric-top">

                    <span>
                      CPSE Monitored
                    </span>

                    <Building2 size={15} />

                  </div>

                  <strong>
                    {cpsePendingData.length}
                  </strong>

                  <small>
                    Active organizations
                  </small>

                </div>


                {/* HIGHEST PENDING */}

                <div className="cpse-summary-metric highest">

                  <div className="cpse-summary-metric-top">

                    <span>
                      Highest Pending
                    </span>

                    <AlertTriangle size={15} />

                  </div>

                  <strong>
                    {formatNumber(
                      highestPendingCPSE.value
                    )}
                  </strong>

                  <small>
                    {highestPendingCPSE.name}
                  </small>

                </div>

              </div>


              {/* CPSE DISTRIBUTION */}

              <div className="cpse-summary-distribution">

                <div className="cpse-summary-distribution-header">

                  <span>
                    Pending Distribution
                  </span>

                  <strong>
                    {cpsePendingData.length} CPSEs
                  </strong>

                </div>


                <div className="cpse-distribution-bar">

                  {cpsePendingData.map(
                    (item) => {

                      const width =
                        (item.value /
                          stats.pending) *
                        100;

                      return (
                        <div
                          key={item.name}
                          className="cpse-distribution-segment"
                          title={`${item.name}: ${formatNumber(
                            item.value
                          )}`}
                          style={{
                            width: `${width}%`,
                            background:
                              item.color,
                          }}
                        />
                      );
                    }
                  )}

                </div>


                <div className="cpse-distribution-labels">

                  {cpsePendingData
                    .slice(0, 4)
                    .map((item) => (
                      <div
                        key={item.name}
                        className="cpse-distribution-label"
                      >

                        <i
                          style={{
                            background:
                              item.color,
                          }}
                        ></i>

                        <span>
                          {item.name}
                        </span>

                      </div>
                    ))}

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =================================================
          PROCESSING INSIGHTS
      ================================================= */}

      <section className="dashboard-section">

        <div className="section-heading">

          <div>

            <h3>
              Processing Insights
            </h3>

            <span>
              Standardization progress and recent
              pending workload
            </span>

          </div>

        </div>


        <div className="processing-insights-grid">

          {/* =================================================
              STANDARDIZATION PROGRESS
          ================================================= */}

          <div className="standardization-progress-card">

            <div className="insight-card-header">

              <div>

                <h4>
                  Standardization Progress
                </h4>

                <span>
                  Overall material standardization coverage
                </span>

              </div>

              <strong className="progress-percentage">
                {standardizationPercentage.toFixed(
                  1
                )}%
              </strong>

            </div>


            <div className="standardization-progress-track">

              <div
                className="standardization-progress-fill"
                style={{
                  width: `${standardizationPercentage}%`,
                }}
              />

            </div>


            <div className="standardization-progress-details">

              <div>

                <span>
                  Standardized
                </span>

                <strong>
                  {formatNumber(
                    stats.standardized
                  )}
                </strong>

              </div>


              <div>

                <span>
                  Remaining
                </span>

                <strong>
                  {formatNumber(
                    remainingMaterials
                  )}
                </strong>

              </div>


              <div>

                <span>
                  Total
                </span>

                <strong>
                  {formatNumber(
                    stats.totalMaterials
                  )}
                </strong>

              </div>

            </div>


            <div className="standardization-status">

              <span className="status-indicator"></span>

              <span>
                Standardization processing is active
              </span>

            </div>

          </div>


          {/* =================================================
              PENDING TREND
          ================================================= */}

          <div className="pending-trend-card">

            <div className="insight-card-header">

              <div>

                <h4>
                  Pending Trend
                </h4>

                <span>
                  Pending material records — last 7 days
                </span>

              </div>


              <div className="trend-current">

                <strong>
                  {formatNumber(
                    stats.pending
                  )}
                </strong>

                <span>
                  Current
                </span>

              </div>

            </div>


            <div className="pending-trend-chart">

              <div className="pending-trend-y-axis">

                <span>
                  {formatNumber(
                    maxPendingTrend
                  )}
                </span>

                <span>
                  {formatNumber(
                    Math.round(
                      (maxPendingTrend +
                        minPendingTrend) /
                        2
                    )
                  )}
                </span>

                <span>
                  {formatNumber(
                    minPendingTrend
                  )}
                </span>

              </div>


              <div className="pending-trend-main">

                <div className="pending-trend-grid">

                  <span></span>
                  <span></span>
                  <span></span>

                </div>


                <div className="pending-trend-line">

                  {pendingTrendData.map(
                    (item, index) => {

                      const range =
                        maxPendingTrend -
                        minPendingTrend;

                      const normalized =
                        range === 0
                          ? 50
                          : ((item.value -
                              minPendingTrend) /
                              range) *
                              75 +
                            10;

                      return (
                        <div
                          className="pending-trend-point"
                          key={item.day}
                          style={{
                            left: `${
                              (index /
                                (pendingTrendData.length -
                                  1)) *
                              100
                            }%`,
                            bottom: `${normalized}%`,
                          }}
                        >

                          <div className="pending-trend-tooltip">
                            {formatNumber(
                              item.value
                            )}
                          </div>

                          <span></span>

                        </div>
                      );
                    }
                  )}


                  <svg
                    className="pending-trend-svg"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >

                    <polyline
                      points={pendingTrendData
                        .map(
                          (item, index) => {

                            const range =
                              maxPendingTrend -
                              minPendingTrend;

                            const normalized =
                              range === 0
                                ? 50
                                : ((item.value -
                                    minPendingTrend) /
                                    range) *
                                    75 +
                                  10;

                            const x =
                              (index /
                                (pendingTrendData.length -
                                  1)) *
                              100;

                            const y =
                              100 -
                              normalized;

                            return `${x},${y}`;
                          }
                        )
                        .join(" ")}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      vectorEffect="non-scaling-stroke"
                    />

                  </svg>

                </div>


                <div className="pending-trend-days">

                  {pendingTrendData.map(
                    (item) => (
                      <span key={item.day}>
                        {item.day}
                      </span>
                    )
                  )}

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =================================================
          SEARCH
      ================================================= */}

      <section
  className="dashboard-section"
  id="dashboard-search-section"
>

        <div className="section-heading">

          <div>

            <h3>
              Search
            </h3>

            <span>
              Find CPSEs, companies and NMC codes
            </span>

          </div>

        </div>


        <div className="search-grid">

          {/* =================================================
              COMPANY SEARCH
          ================================================= */}

          <div className="search-panel">

            <div className="search-panel-header">

              <div className="search-panel-icon">
                <Building2 size={18} />
              </div>

              <div>

                <h4>
                  CPSE / Company
                </h4>

                <span>
                  Search by organization,
                  city or state
                </span>

              </div>

            </div>


            <div className="dashboard-search">

              <Search size={17} />

              <input
                value={companySearch}
                onChange={(e) =>
                  setCompanySearch(
                    e.target.value
                  )
                }
                placeholder="Search CPSE or company..."
              />

              {companySearch && (
                <button
                  onClick={() =>
                    setCompanySearch("")
                  }
                >
                  Clear
                </button>
              )}

            </div>


            {companySearch && (
              <div className="search-results">

                {companyResults.length > 0 ? (

                  companyResults.map(
                    (cpse) => (

                      <div
                        className="search-result"
                        key={cpse.id}
                        onClick={() =>
                          setSelectedCompany(
                            cpse
                          )
                        }
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {

                          if (
                            e.key === "Enter"
                          ) {
                            setSelectedCompany(
                              cpse
                            );
                          }

                        }}
                      >

                        <div className="result-icon">
                          <Building2 size={16} />
                        </div>

                        <div className="result-info">

                          <strong>
                            {cpse.shortName}
                          </strong>

                          <span>
                            {cpse.name}
                          </span>

                          <small>
                            {cpse.city},{" "}
                            {cpse.state}
                          </small>

                        </div>

                        <ArrowRight size={15} />

                      </div>

                    )
                  )

                ) : (

                  <div className="no-results">
                    No matching CPSE found.
                  </div>

                )}

              </div>
            )}

          </div>


          {/* =================================================
              NMC SEARCH
          ================================================= */}

          <div className="search-panel">

            <div className="search-panel-header">

              <div className="search-panel-icon">
                <Hash size={18} />
              </div>

              <div>

                <h4>
                  NMC Code
                </h4>

                <span>
                  Search standardized material codes
                </span>

              </div>

            </div>


            <div className="dashboard-search">

              <Search size={17} />

              <input
                value={nmcSearch}
                onChange={(e) =>
                  setNmcSearch(
                    e.target.value
                  )
                }
                placeholder="Search NMC code..."
              />

              {nmcSearch && (
                <button
                  onClick={() =>
                    setNmcSearch("")
                  }
                >
                  Clear
                </button>
              )}

            </div>


            {nmcSearch && (
              <div className="search-results">

                {nmcResults.length > 0 ? (

                  nmcResults.map(
                    (item) => (

                      <div
                        className="search-result"
                        key={item.code}
                        onClick={() =>
                          setSelectedNMC(
                            item
                          )
                        }
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {

                          if (
                            e.key === "Enter"
                          ) {
                            setSelectedNMC(
                              item
                            );
                          }

                        }}
                      >

                        <div className="result-icon">
                          <Hash size={16} />
                        </div>

                        <div className="result-info">

                          <strong>
                            {item.code}
                          </strong>

                          <span>
                            {item.description}
                          </span>

                          <small>
                            {item.category} •{" "}
                            {item.cpse}
                          </small>

                        </div>

                        <ArrowRight size={15} />

                      </div>

                    )
                  )

                ) : (

                  <div className="no-results">
                    No matching NMC code found.
                  </div>

                )}

              </div>
            )}

          </div>

        </div>


        {/* =================================================
            SELECTED COMPANY DETAILS
        ================================================= */}

        {selectedCompany && (
          <div className="company-details-panel">

            <div className="company-details-header">

              <div className="company-details-title">

                <div className="company-large-icon">
                  <Building2 size={22} />
                </div>

                <div>

                  <span>
                    CPSE ORGANIZATION
                  </span>

                  <h3>
                    {selectedCompany.name}
                  </h3>

                  <p>
                    {selectedCompany.shortName} •{" "}
                    {selectedCompany.city},{" "}
                    {selectedCompany.state}
                  </p>

                </div>

              </div>


              <button
                className="company-close"
                onClick={() =>
                  setSelectedCompany(null)
                }
              >
                ×
              </button>

            </div>


            <div className="company-details-grid">

              <div className="company-detail-item">

                <span>
                  Organization Code
                </span>

                <strong>
                  {selectedCompany.shortName}
                </strong>

              </div>


              <div className="company-detail-item">

                <span>
                  Sector
                </span>

                <strong>
                  {selectedCompany.sector || "—"}
                </strong>

              </div>


              <div className="company-detail-item">

                <span>
                  Location
                </span>

                <strong>
                  {selectedCompany.city},{" "}
                  {selectedCompany.state}
                </strong>

              </div>


              <div className="company-detail-item">

                <span>
                  Status
                </span>

                <strong className="company-status">

                  <i></i>

                  Active

                </strong>

              </div>

            </div>


            <div className="company-material-section">

              <div className="company-section-heading">

                <div>

                  <h4>
                    Material Intelligence
                  </h4>

                  <span>
                    Material records associated
                    with this CPSE
                  </span>

                </div>

              </div>


              <div className="company-material-grid">

                <div>

                  <span>
                    Total Materials
                  </span>

                  <strong>
                    {selectedCompany.materials?.toLocaleString() ||
                      "—"}
                  </strong>

                </div>


                <div>

                  <span>
                    Mapped Materials
                  </span>

                  <strong>
                    {selectedCompany.mapped?.toLocaleString() ||
                      "—"}
                  </strong>

                </div>


                <div>

                  <span>
                    Mapping Coverage
                  </span>

                  <strong>
                    {selectedCompany.materials &&
                    selectedCompany.mapped != null
                      ? Math.round(
                          (selectedCompany.mapped /
                            selectedCompany.materials) *
                            100
                        ) + "%"
                      : "—"}
                  </strong>

                </div>

              </div>


              {selectedCompany.materials &&
                selectedCompany.mapped != null && (
                  <div className="company-coverage">

                    <div className="company-coverage-header">

                      <span>
                        Mapping Coverage
                      </span>

                      <strong>
                        {Math.round(
                          (selectedCompany.mapped /
                            selectedCompany.materials) *
                            100
                        )}
                        %
                      </strong>

                    </div>


                    <div className="company-coverage-track">

                      <div
                        style={{
                          width: `${
                            (selectedCompany.mapped /
                              selectedCompany.materials) *
                            100
                          }%`,
                        }}
                      />

                    </div>

                  </div>
                )}

            </div>

          </div>
        )}


        {/* =================================================
            SELECTED NMC DETAILS
        ================================================= */}

        {selectedNMC && (
          <div className="nmc-details-panel">

            <div className="nmc-details-header">

              <div className="nmc-details-title">

                <div className="nmc-large-icon">
                  <Hash size={22} />
                </div>

                <div>

                  <span>
                    NATIONAL MATERIAL CODE
                  </span>

                  <h3>
                    {selectedNMC.code}
                  </h3>

                  <p>
                    {selectedNMC.description}
                  </p>

                </div>

              </div>


              <button
                className="company-close"
                onClick={() =>
                  setSelectedNMC(null)
                }
              >
                ×
              </button>

            </div>


            <div className="nmc-details-grid">

              <div className="nmc-detail-item">

                <span>
                  NMC Code
                </span>

                <strong>
                  {selectedNMC.code}
                </strong>

              </div>


              <div className="nmc-detail-item">

                <span>
                  Material Description
                </span>

                <strong>
                  {selectedNMC.description}
                </strong>

              </div>


              <div className="nmc-detail-item">

                <span>
                  Category
                </span>

                <strong>
                  {selectedNMC.category}
                </strong>

              </div>


              <div className="nmc-detail-item">

                <span>
                  Originating CPSE
                </span>

                <strong>
                  {selectedNMC.cpse}
                </strong>

              </div>

            </div>


            <div className="nmc-status-section">

              <div className="nmc-status-heading">

                <div>

                  <h4>
                    Standardization Status
                  </h4>

                  <span>
                    Current status of this material code
                  </span>

                </div>

                <span className="nmc-status-badge">
                  STANDARDIZED
                </span>

              </div>


              <div className="nmc-status-grid">

                <div>

                  <span>
                    Code Status
                  </span>

                  <strong className="nmc-active-status">

                    <i></i>

                    Active

                  </strong>

                </div>


                <div>

                  <span>
                    Material Category
                  </span>

                  <strong>
                    {selectedNMC.category}
                  </strong>

                </div>


                <div>

                  <span>
                    CPSE Usage
                  </span>

                  <strong>
                    {selectedNMC.cpse}
                  </strong>

                </div>

              </div>

            </div>

          </div>
        )}

      </section>


      {/* =================================================
          SEARCH FREQUENCY
      ================================================= */}

      <section className="dashboard-section">

        <div className="section-heading">

          <div>

            <h3>
              Search Frequency
            </h3>

            <span>
              Most frequently searched CPSEs and NMC codes
            </span>

          </div>

          <div className="frequency-period">
            Last 30 days
          </div>

        </div>


        <div className="frequency-grid">

          {/* =================================================
              CPSE SEARCH FREQUENCY
          ================================================= */}

          <div className="frequency-card">

            <div className="frequency-header">

              <div className="frequency-heading">

                <Building2 size={17} />

                <div>

                  <h4>
                    CPSE / Company
                  </h4>

                  <span>
                    Search frequency
                  </span>

                </div>

              </div>

              <strong>
                1,284
              </strong>

            </div>


            <div className="frequency-chart">

              <FrequencyRow
                rank="01"
                name="Indian Oil Corporation"
                code="IOCL"
                count="186"
                percentage={100}
              />

              <FrequencyRow
                rank="02"
                name="Bharat Petroleum Corporation"
                code="BPCL"
                count="143"
                percentage={77}
              />

              <FrequencyRow
                rank="03"
                name="NTPC Limited"
                code="NTPC"
                count="121"
                percentage={65}
              />

              <FrequencyRow
                rank="04"
                name="Oil & Natural Gas Corporation"
                code="ONGC"
                count="98"
                percentage={53}
              />

              <FrequencyRow
                rank="05"
                name="Chennai Petroleum Corporation"
                code="CPCL"
                count="76"
                percentage={41}
              />

            </div>

          </div>


          {/* =================================================
              NMC SEARCH FREQUENCY
          ================================================= */}

          <div className="frequency-card">

            <div className="frequency-header">

              <div className="frequency-heading">

                <Hash size={17} />

                <div>

                  <h4>
                    NMC Codes
                  </h4>

                  <span>
                    Search frequency
                  </span>

                </div>

              </div>

              <strong>
                3,842
              </strong>

            </div>


            <div className="frequency-chart">

              <FrequencyRow
                rank="01"
                name="Ball Bearing 6205"
                code="NMC-0001842"
                count="214"
                percentage={100}
              />

              <FrequencyRow
                rank="02"
                name="Carbon Steel Pipe"
                code="NMC-0001843"
                count="187"
                percentage={87}
              />

              <FrequencyRow
                rank="03"
                name="Industrial Valve"
                code="NMC-0001844"
                count="156"
                percentage={73}
              />

              <FrequencyRow
                rank="04"
                name="Copper Cable"
                code="NMC-0001845"
                count="134"
                percentage={63}
              />

              <FrequencyRow
                rank="05"
                name="Pressure Gauge"
                code="NMC-0001846"
                count="102"
                percentage={48}
              />

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}


/* =========================================================
   FREQUENCY ROW
========================================================= */

function FrequencyRow({
  rank,
  name,
  code,
  count,
  percentage,
}) {
  return (
    <div className="frequency-row">

      <div className="frequency-rank">
        {rank}
      </div>


      <div className="frequency-item">

        <div className="frequency-item-info">

          <strong>
            {name}
          </strong>

          <span>
            {code}
          </span>

        </div>


        <div className="frequency-bar-area">

          <div className="frequency-bar-track">

            <div
              className="frequency-bar-fill"
              style={{
                width: `${percentage}%`,
              }}
            />

          </div>

        </div>

      </div>


      <div className="frequency-value">
        {count}
      </div>

    </div>
  );
}


/* =========================================================
   NUMBER FORMAT
========================================================= */

function formatNumber(number) {
  return new Intl.NumberFormat("en-IN").format(
    toFiniteNumber(number)
  );
}


function toFiniteNumber(value) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}


export default Dashboard;