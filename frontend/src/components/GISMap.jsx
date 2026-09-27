import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  LayersControl,
  useMap,
} from "react-leaflet";

import MarkerClusterGroup from "react-leaflet-cluster";

import L from "leaflet";
import { useEffect } from "react";

import { cpseData } from "../data/cpseData";

/* =========================================================
   CUSTOM CPSE MARKER
========================================================= */

const cpseIcon = L.divIcon({
  className: "cpse-map-marker",
  html: `
    <div class="cpse-marker-inner">
      <div class="cpse-marker-symbol">⌂</div>
    </div>
    <div class="cpse-marker-shadow"></div>
  `,
  iconSize: [42, 50],
  iconAnchor: [21, 50],
  popupAnchor: [0, -46],
});

/* =========================================================
   CUSTOM CLUSTER ICON
========================================================= */

function createClusterIcon(cluster) {
  const count = cluster.getChildCount();

  let size = "small";

  if (count >= 10) {
    size = "large";
  } else if (count >= 5) {
    size = "medium";
  }

  return L.divIcon({
    html: `
      <div class="cpse-cluster ${size}">
        <span>${count}</span>
      </div>
    `,
    className: "cpse-cluster-wrapper",
    iconSize: [52, 52],
  });
}

/* =========================================================
   MAP CONTROLLER
========================================================= */

function MapController({ selectedCPSE }) {
  const map = useMap();

  useEffect(() => {
    if (!selectedCPSE) return;

    map.flyTo(
      [selectedCPSE.lat, selectedCPSE.lng],
      11,
      {
        duration: 1.2,
      }
    );
  }, [selectedCPSE, map]);

  return null;
}

/* =========================================================
   GIS MAP
========================================================= */

function GISMap({
  selectedCPSE,
  onSelectCPSE,
}) {
  return (
    <div className="gis-map-wrapper">

      <MapContainer
  center={[22.5, 79]}
  zoom={5}
  minZoom={5}
  maxZoom={18}
        scrollWheelZoom={true}
        zoomControl={true}
        className="gis-map"
      >

        {/* =================================================
            MAP LAYERS
        ================================================= */}

        <LayersControl position="topright">

          <LayersControl.BaseLayer
            checked
            name="Satellite"
          >
            <TileLayer
              attribution="&copy; Esri"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Street Map">
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="Terrain">
            <TileLayer
              attribution="&copy; OpenTopoMap contributors"
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>

        </LayersControl>


        {/* =================================================
            CPSE MARKER CLUSTER
        ================================================= */}

        <MarkerClusterGroup
          chunkedLoading={true}
          showCoverageOnHover={false}
          spiderfyOnMaxZoom={true}

          /* Click cluster → zoom into its area */
          zoomToBoundsOnClick={true}

          /* At zoom 9+, show individual CPSE markers */
          disableClusteringAtZoom={9}

          /* Distance at which markers form clusters */
          maxClusterRadius={45}

          animate={true}
          animateAddingMarkers={true}

          iconCreateFunction={createClusterIcon}
        >

          {cpseData.map((cpse) => (

            <Marker
              key={cpse.id}
              position={[
                cpse.lat,
                cpse.lng,
              ]}
              icon={cpseIcon}
              eventHandlers={{
                click: () => {
                  onSelectCPSE(cpse);
                },
              }}
            >

              {/* =================================================
                  CPSE POPUP
              ================================================= */}

              <Popup>

                <div className="cpse-popup">

                  <div className="popup-top">

                    <div className="popup-code">
                      {cpse.shortName}
                    </div>

                    <span className="popup-active">
                      ACTIVE
                    </span>

                  </div>


                  <h3>
                    {cpse.name}
                  </h3>


                  <p className="popup-location">
                    {cpse.city}, {cpse.state}
                  </p>


                  <div className="popup-sector">
                    {cpse.sector}
                  </div>


                  {/* MATERIAL STATS */}

                  <div className="popup-stats">

                    <div>

                      <strong>
                        {cpse.materials.toLocaleString()}
                      </strong>

                      <span>
                        Material Records
                      </span>

                    </div>


                    <div>

                      <strong>
                        {cpse.mapped.toLocaleString()}
                      </strong>

                      <span>
                        Mapped Records
                      </span>

                    </div>

                  </div>


                  {/* COVERAGE */}

                  <div className="popup-progress">

                    <div className="popup-progress-header">

                      <span>
                        Mapping Coverage
                      </span>

                      <strong>
                        {Math.round(
                          (cpse.mapped /
                            cpse.materials) *
                            100
                        )}
                        %
                      </strong>

                    </div>


                    <div className="popup-progress-track">

                      <div
                        style={{
                          width: `${
                            (cpse.mapped /
                              cpse.materials) *
                              100
                          }%`,
                        }}
                      />

                    </div>

                  </div>


                  {/* OPEN MATERIAL MAPPING */}

                  <button
                    className="popup-button"
                    onClick={() =>
                      onSelectCPSE(cpse)
                    }
                  >
                    Open Material Mapping
                  </button>

                </div>

              </Popup>

            </Marker>

          ))}

        </MarkerClusterGroup>


        {/* =================================================
            SELECTED CPSE CONTROLLER
        ================================================= */}

        <MapController
          selectedCPSE={selectedCPSE}
        />

      </MapContainer>


      {/* =================================================
          MAP INFORMATION
      ================================================= */}

      <div className="map-overlay">

        <div className="map-overlay-title">
          CPSE Geographic Distribution
        </div>

        <div className="map-overlay-subtitle">
          Explore material intelligence across
          India's CPSE network
        </div>

      </div>


      {/* =================================================
          MAP LEGEND
      ================================================= */}

      <div className="map-legend">

        <div className="legend-title">
          MAP LEGEND
        </div>


        <div className="legend-item">

          <span className="legend-marker"></span>

          <span>
            CPSE Location
          </span>

        </div>


        <div className="legend-item">

          <span className="legend-cluster">
            12
          </span>

          <span>
            CPSE Cluster
          </span>

        </div>

      </div>

    </div>
  );
}

export default GISMap;