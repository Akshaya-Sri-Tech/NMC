
import { useEffect, useMemo, useState } from "react";

import {
  Search,
  Package,
  Building2,
  Hash,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Layers3,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

import { getSampleMaterials } from "./api";


/* =========================================================
   DUMMY FRONTEND NMC MAPPING

   Temporary frontend mapping because the real NMC
   harmonization backend is not working yet.

   One NMC code → multiple CPSE material records.
   ========================================================= */

const dummyNMCMapping = {

  "NMC-BLT-0001": [
    "ONGC-BLT-001",
    "CPCL-BLT-001",
    "SAIL-BLT-045",
    "BHEL-BLT-016",
  ],

  "NMC-VLV-0002": [
    "ONGC-VAL-001",
    "CPCL-VAL-019",
    "ONGC-VAL-014",
    "CPCL-VAL-014",
  ],

  "NMC-PIP-0003": [
    "ONGC-PIPE-001",
    "CPCL-PIPE-021",
    "ONGC-PIPE-011",
    "CPCL-PIPE-011",
  ],

  "NMC-CBL-0004": [
    "ONGC-CBL-007",
    "CPCL-CBL-014",
    "BHEL-CBL-013",
  ],

  "NMC-BRG-0005": [
    "NMDC-BRG-013",
    "CPCL-BRG-025",
    "NMDC-BRG-025",
  ],

  "NMC-LUB-0006": [
    "ONGC-OIL-018",
    "CPCL-OIL-018",
  ],

  "NMC-PMP-0007": [
    "ONGC-PMP-020",
    "BHEL-PMP-020",
  ],

  "NMC-INS-0008": [
    "ONGC-PT-021",
    "CPCL-PT-021",
    "ONGC-PT-022",
  ],

  "NMC-GSK-0009": [
    "NMDC-GSK-024",
    "ONGC-GSK-024",
  ],

  "NMC-MAT-0010": [
    "SAIL-PLT-017",
    "SAIL-PLT-018",
    "ONGC-CHM-019",
    "CPCL-CHM-019",
  ],

};


/* =========================================================
   GET DUMMY NMC CODE
   ========================================================= */

function getDummyNMCCode(materialCode) {

  const code =
    String(materialCode || "")
      .trim()
      .toUpperCase();


  for (
    const [nmcCode, materialCodes]
    of Object.entries(dummyNMCMapping)
  ) {

    if (
      materialCodes
        .map((item) =>
          String(item)
            .trim()
            .toUpperCase()
        )
        .includes(code)
    ) {

      return nmcCode;

    }

  }


  return null;

}


/* =========================================================
   FALLBACK CATEGORY PREFIX
   ========================================================= */

function getCategoryPrefix(
  category,
  description
) {

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


  if (text.includes("VALVE")) {
    return "VLV";
  }


  if (
    text.includes("PIPE") ||
    text.includes("TUBE")
  ) {
    return "PIP";
  }


  if (text.includes("BEARING")) {
    return "BRG";
  }


  if (
    text.includes("CABLE") ||
    text.includes("WIRE")
  ) {
    return "CBL";
  }


  if (text.includes("PUMP")) {
    return "PMP";
  }


  if (text.includes("MOTOR")) {
    return "MTR";
  }


  if (text.includes("FILTER")) {
    return "FLT";
  }


  if (text.includes("GASKET")) {
    return "GSK";
  }


  if (
    text.includes("OIL") ||
    text.includes("LUBRICANT")
  ) {
    return "LUB";
  }


  if (
    text.includes("INSTRUMENT") ||
    text.includes("TRANSMITTER") ||
    text.includes("PRESSURE")
  ) {
    return "INS";
  }


  return "MAT";

}


/* =========================================================
   COMPONENT
   ========================================================= */

function NMCCode() {

  /* =======================================================
     BACKEND DATA
  ======================================================= */

  const [
    nmcMaterials,
    setNmcMaterials
  ] = useState([]);


  const [
    loading,
    setLoading
  ] = useState(true);


  const [
    error,
    setError
  ] = useState("");


  /* =======================================================
     SEARCH STATE
  ======================================================= */

  const [
    nmcSearch,
    setNmcSearch
  ] = useState("");


  const [
    searchedCode,
    setSearchedCode
  ] = useState("");


  /* =======================================================
     MAPPING DECK STATE

     0 = first card
     1 = second card
     2 = third card
     ...
  ======================================================= */

  const [
    activeCardIndex,
    setActiveCardIndex
  ] = useState(0);


  const [
    deckStarted,
    setDeckStarted
  ] = useState(false);


  /* =======================================================
     LOAD MATERIALS
  ======================================================= */

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
     ADD NMC CODE TO MATERIALS
  ======================================================= */

  const materialsWithNMC =
    useMemo(() => {

      return nmcMaterials.map(
        (item, index) => {

          const dummyCode =
            getDummyNMCCode(
              item.material_code
            );


          let nmcCode =
            dummyCode;


          if (!nmcCode) {

            const prefix =
              getCategoryPrefix(
                item.category,
                item.material_description
              );


            nmcCode =
              `NMC-${prefix}-${String(
                index + 100
              ).padStart(4, "0")}`;

          }


          return {
            ...item,
            nmc_code: nmcCode,
          };

        }
      );

    }, [
      nmcMaterials,
    ]);


  /* =======================================================
     FIND SEARCHED NMC GROUP
  ======================================================= */

  const searchedNMCGroup =
    useMemo(() => {

      if (!searchedCode) {

        return null;

      }


      const entry =
        Object.entries(
          dummyNMCMapping
        ).find(
          ([nmcCode]) =>
            nmcCode.toUpperCase() ===
            searchedCode
        );


      if (!entry) {

        return null;

      }


      const [
        nmcCode,
        materialCodes
      ] = entry;


      const normalizedCodes =
        materialCodes.map(
          (code) =>
            String(code)
              .trim()
              .toUpperCase()
        );


      const mappedMaterials =
        materialsWithNMC.filter(
          (item) =>
            normalizedCodes.includes(
              String(
                item.material_code || ""
              )
                .trim()
                .toUpperCase()
            )
        );


      return {
        nmcCode,
        mappedMaterials,
      };

    }, [
      searchedCode,
      materialsWithNMC,
    ]);


  /* =======================================================
     SEARCH
  ======================================================= */

  const handleSearch = () => {

    const value =
      nmcSearch
        .trim()
        .toUpperCase();


    setSearchedCode(value);

    setActiveCardIndex(0);

    setDeckStarted(false);

  };


  /* =======================================================
     ENTER KEY
  ======================================================= */

  const handleKeyDown = (event) => {

    if (
      event.key === "Enter"
    ) {

      handleSearch();

    }

  };


  /* =======================================================
     START / ADVANCE CARD DECK
  ======================================================= */

  const handleCardClick = () => {

    if (!searchedNMCGroup) {

      return;

    }


    const total =
      searchedNMCGroup
        .mappedMaterials
        .length;


    if (!deckStarted) {

      setDeckStarted(true);

      setActiveCardIndex(0);

      return;

    }


    if (
      activeCardIndex <
      total - 1
    ) {

      setActiveCardIndex(
        (previous) =>
          previous + 1
      );

    }

  };


  /* =======================================================
     RESET DECK
  ======================================================= */

  const resetDeck = () => {

    setDeckStarted(false);

    setActiveCardIndex(0);

  };


  /* =======================================================
     PREVIOUS CARD
  ======================================================= */

  const previousCard = () => {

    if (
      activeCardIndex > 0
    ) {

      setActiveCardIndex(
        (previous) =>
          previous - 1
      );

    }

  };


  /* =======================================================
     LOADING
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
            Fetching material information
            from the backend.
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
            and explore its mapped CPSE materials.
          </p>

        </div>

      </div>


      {/* =================================================
          ERROR
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
                Enter an NMC code to explore
                its mapped material records.
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
          SEARCH RESULT
      ================================================= */}

      {searchedCode && (

        <section className="nmc-results-section">


          {searchedNMCGroup ? (

            <>
              {/* =========================================
                  NMC SUMMARY CARD
              ========================================= */}

              <div className="nmc-code-summary-card">

                <div className="nmc-code-summary-left">

                  <div className="nmc-summary-eyebrow">

                    NMC CODE

                  </div>


                  <div className="nmc-summary-code">

                    <Hash size={21} />

                    <span>
                      {searchedNMCGroup.nmcCode}
                    </span>

                  </div>


                  <p>
                    Standardized material group
                    across participating CPSEs.
                  </p>

                </div>


                <div className="nmc-summary-stat">

                  <Layers3 size={20} />

                  <div>

                    <span>
                      TOTAL MAPPED
                    </span>

                    <strong>
                      {
                        searchedNMCGroup
                          .mappedMaterials
                          .length
                      }
                    </strong>

                    <small>
                      materials
                    </small>

                  </div>

                </div>


                <div className="nmc-summary-action">

                  <button
                    type="button"
                    onClick={handleCardClick}
                  >

                    {deckStarted
                      ? "View Next Material"
                      : "View Mapped Materials"}

                    <ArrowRight
                      size={17}
                    />

                  </button>

                </div>

              </div>


              {/* =========================================
                  MAPPING DECK
              ========================================= */}

              {deckStarted && (

                <div className="nmc-material-deck-section">


                  {/* =====================================
                      DECK HEADER
                  ===================================== */}

                  <div className="nmc-deck-header">

                    <div>

                      <div className="nmc-deck-eyebrow">

                        MAPPED MATERIALS

                      </div>

                      <h3>
                        {searchedNMCGroup.nmcCode}
                      </h3>

                      <p>
                        CPSE material records mapped
                        to this standardized code.
                      </p>

                    </div>


                    <div className="nmc-deck-progress">

                      <strong>
                        {activeCardIndex + 1}
                      </strong>

                      <span>
                        /
                        {" "}
                        {
                          searchedNMCGroup
                            .mappedMaterials
                            .length
                        }
                      </span>

                    </div>

                  </div>


                  {/* =====================================
                      CARD DECK
                  ===================================== */}

                  <div
                    className="nmc-card-deck"
                    style={{
                      "--deck-count":
                        searchedNMCGroup
                          .mappedMaterials
                          .length,
                    }}
                  >

                    {searchedNMCGroup
                      .mappedMaterials
                      .map(
                        (item, index) => {

                          const position =
                            index -
                            activeCardIndex;


                          const isActive =
                            index ===
                            activeCardIndex;


                          if (
                            position < 0
                          ) {

                            return null;

                          }


                          return (

                            <div
                              key={
                                `${item.material_id}-${index}`
                              }
                              className={
                                `nmc-material-card
                                ${
                                  isActive
                                    ? "active"
                                    : ""
                                }
                                ${
                                  position > 0
                                    ? "behind"
                                    : ""
                                }`
                              }
                              style={{
                                "--card-position":
                                  Math.min(
                                    position,
                                    3
                                  ),
                              }}
                              onClick={
                                isActive
                                  ? handleCardClick
                                  : undefined
                              }
                            >

                              {/* CARD TOP */}

                              <div className="nmc-material-card-top">

                                <div className="nmc-material-card-number">

                                  <span>
                                    MATERIAL
                                  </span>

                                  <strong>
                                    {String(
                                      index + 1
                                    ).padStart(
                                      2,
                                      "0"
                                    )}
                                  </strong>

                                </div>


                                <div className="nmc-material-card-cpse">

                                  <Building2
                                    size={15}
                                  />

                                  <span>
                                    {
                                      item.cpse_code ||
                                      item.cpse_name ||
                                      "CPSE"
                                    }
                                  </span>

                                </div>

                              </div>


                              {/* CARD CONTENT */}

                              <div className="nmc-material-card-content">

                                <div className="nmc-material-card-code">

                                  {
                                    item.material_code ||
                                    "—"
                                  }

                                </div>


                                <h4>

                                  {
                                    item.material_description ||
                                    "Material description unavailable"
                                  }

                                </h4>


                                <div className="nmc-material-card-grid">


                                  <div>

                                    <span>
                                      CATEGORY
                                    </span>

                                    <strong>
                                      {
                                        item.category ||
                                        "—"
                                      }
                                    </strong>

                                  </div>


                                  <div>

                                    <span>
                                      CPSE
                                    </span>

                                    <strong>
                                      {
                                        item.cpse_name ||
                                        item.cpse_code ||
                                        "—"
                                      }
                                    </strong>

                                  </div>


                                  <div className="full">

                                    <span>
                                      STANDARD SPECIFICATION
                                    </span>

                                    <strong>
                                      {
                                        item.specification ||
                                        item.material_description ||
                                        "—"
                                      }
                                    </strong>

                                  </div>

                                </div>

                              </div>


                              {/* CARD FOOTER */}

                              <div className="nmc-material-card-footer">

                                <span>

                                  {isActive
                                    ? index ===
                                      searchedNMCGroup
                                        .mappedMaterials
                                        .length -
                                        1
                                      ? "Final mapped material"
                                      : "Click card to reveal next material"
                                    : "Next"}

                                </span>


                                {isActive && (
                                  index <
                                  searchedNMCGroup
                                    .mappedMaterials
                                    .length -
                                    1 ? (

                                    <ArrowRight
                                      size={17}
                                    />

                                  ) : (

                                    <Layers3
                                      size={17}
                                    />

                                  )
                                )}

                              </div>

                            </div>

                          );

                        }
                      )}

                  </div>


                  {/* =====================================
                      DECK CONTROLS
                  ===================================== */}

                  <div className="nmc-deck-controls">

                    <button
                      type="button"
                      className="nmc-deck-back"
                      onClick={previousCard}
                      disabled={
                        activeCardIndex === 0
                      }
                    >

                      <ArrowLeft
                        size={15}
                      />

                      Previous

                    </button>


                    <span>
                      Click the visible card to
                      reveal the next material
                    </span>


                    <button
                      type="button"
                      className="nmc-deck-reset"
                      onClick={resetDeck}
                    >

                      <RotateCcw
                        size={14}
                      />

                      Reset

                    </button>

                  </div>

                </div>

              )}

            </>

          ) : (

            /* ===========================================
               NOT FOUND
            =========================================== */

            <div className="nmc-empty-state">

              <AlertCircle size={30} />

              <h3>
                NMC code not found
              </h3>

              <p>
                No mapped material group was found
                for <strong>{searchedCode}</strong>.
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
            Enter an NMC code above to explore
            its mapped CPSE material records.
          </p>

        </div>

      )}

    </div>

  );

}


export default NMCCode;

