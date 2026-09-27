import { useState } from "react";

import {
  Search,
  Filter,
  MapPin,
  Layers,
  Database,
  ArrowRight,
  Building2,
  CheckCircle2,
  BarChart3,
} from "lucide-react";

import GISMap from "./GISMap";

import { cpseData } from "../data/cpseData";

function MaterialMapping() {

  const [search, setSearch] = useState("");

  const [selectedCPSE, setSelectedCPSE] =
    useState(null);

  const filteredCPSE =
    cpseData.filter((cpse) => {

      const query =
        search.toLowerCase();

      return (
        cpse.name
          .toLowerCase()
          .includes(query) ||

        cpse.shortName
          .toLowerCase()
          .includes(query) ||

        cpse.city
          .toLowerCase()
          .includes(query) ||

        cpse.state
          .toLowerCase()
          .includes(query)
      );

    });

  const mappingPercentage =
    selectedCPSE
      ? Math.round(
          (selectedCPSE.mapped /
            selectedCPSE.materials) *
            100
        )
      : 0;

  return (

    <div className="material-page">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="page-heading">

        <div>

          <div className="eyebrow">
            MATERIAL INTELLIGENCE
          </div>

          <h2>
            Geographic Material Mapping
          </h2>

          <p>
            Explore CPSE material inventories,
            locations and standardized material
            codes across India.
          </p>

        </div>

        <div className="mapping-status">

          <span></span>

          GIS services online

        </div>

      </div>


      {/* =================================================
          MAIN MAPPING AREA
      ================================================= */}

      <div className="mapping-layout">

        {/* =================================================
            LEFT CPSE PANEL
        ================================================= */}

        <aside className="cpse-panel">

          <div className="panel-header">

            <div>

              <h3>
                CPSE Locations
              </h3>

              <span>
                {cpseData.length}
                {" "}organizations
              </span>

            </div>

            <button className="filter-button">

              <Filter size={17} />

            </button>

          </div>


          {/* SEARCH */}

          <div className="cpse-search">

            <Search size={17} />

            <input
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search CPSE, city or state..."
            />

          </div>


          {/* SELECTED CPSE SUMMARY */}

          {selectedCPSE && (

            <div className="selected-cpse-card">

              <div className="selected-cpse-heading">

                <div className="selected-cpse-icon">

                  <Building2
                    size={18}
                  />

                </div>

                <div>

                  <strong>
                    {selectedCPSE.shortName}
                  </strong>

                  <span>
                    Selected CPSE
                  </span>

                </div>

              </div>


              <div className="selected-cpse-name">

                {selectedCPSE.name}

              </div>


              <div className="selected-cpse-location">

                <MapPin size={14} />

                {selectedCPSE.city},{" "}
                {selectedCPSE.state}

              </div>


              {/* PROGRESS */}

              <div className="selected-progress">

                <div className="selected-progress-header">

                  <span>
                    Material Mapping
                  </span>

                  <strong>
                    {mappingPercentage}%
                  </strong>

                </div>

                <div className="selected-progress-track">

                  <div
                    style={{
                      width:
                        `${mappingPercentage}%`,
                    }}
                  />

                </div>

              </div>


              {/* STATS */}

              <div className="selected-stats">

                <div>

                  <strong>
                    {selectedCPSE.materials.toLocaleString()}
                  </strong>

                  <span>
                    Materials
                  </span>

                </div>

                <div>

                  <strong>
                    {selectedCPSE.mapped.toLocaleString()}
                  </strong>

                  <span>
                    Mapped
                  </span>

                </div>

              </div>

            </div>

          )}


          {/* CPSE LIST */}

          <div className="cpse-list">

            {filteredCPSE.map(
              (cpse) => (

                <button
                  key={cpse.id}
                  className={
                    `cpse-list-item ${
                      selectedCPSE?.id ===
                      cpse.id
                        ? "selected"
                        : ""
                    }`
                  }
                  onClick={() =>
                    setSelectedCPSE(
                      cpse
                    )
                  }
                >

                  <div className="cpse-icon">

                    <Building2
                      size={17}
                    />

                  </div>


                  <div className="cpse-list-info">

                    <strong>
                      {cpse.shortName}
                    </strong>

                    <span>
                      {cpse.city},{" "}
                      {cpse.state}
                    </span>

                  </div>


                  <ArrowRight
                    size={16}
                  />

                </button>

              )
            )}

          </div>

        </aside>


        {/* =================================================
            RIGHT MAP
        ================================================= */}

        <section className="map-section">

          <GISMap
            selectedCPSE={
              selectedCPSE
            }
            onSelectCPSE={
              setSelectedCPSE
            }
          />


          {/* MAP FOOTER */}

          <div className="map-footer">

            <div className="map-info">

              <MapPin size={17} />

              <span>

                {selectedCPSE
                  ? `${selectedCPSE.name} • ${selectedCPSE.city}`
                  : "India • All CPSE locations"}

              </span>

            </div>


            <div className="map-tools">

              <div>

                <Layers size={16} />

                Satellite

              </div>

              <div>

                <Database size={16} />

                Material Database

              </div>

            </div>

          </div>


   {/* =================================================
    MATERIAL SUMMARY
================================================= */}

{selectedCPSE && (
  <div className="material-summary-panel">

    <div className="summary-title">

      <div>
        <span>
          MATERIAL MAPPING
        </span>

        <h3>
          {selectedCPSE.shortName} Material Overview
        </h3>
      </div>

      <button
        className="summary-close"
        onClick={() => setSelectedCPSE(null)}
        aria-label="Close material details"
      >
        ×
      </button>

    </div>

    <div className="summary-metrics">

      <div>
        <div className="summary-icon">
          <Database size={17} />
        </div>

        <span>Total Materials</span>

        <strong>
          {selectedCPSE.materials.toLocaleString()}
        </strong>
      </div>


      <div>
        <div className="summary-icon">
          <CheckCircle2 size={17} />
        </div>

        <span>Standardized</span>

        <strong>
          {selectedCPSE.mapped.toLocaleString()}
        </strong>
      </div>


      <div>
        <div className="summary-icon">
          <BarChart3 size={17} />
        </div>

        <span>Coverage</span>

        <strong>
          {mappingPercentage}%
        </strong>
      </div>

    </div>

  </div>
)}

        </section>

      </div>

    </div>

  );
}

export default MaterialMapping;