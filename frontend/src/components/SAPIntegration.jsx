import React, { useState } from "react";
import {
  Database,
  Upload,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronDown,
} from "lucide-react";

const CPSE_OPTIONS = [
  {
    name: "ONGC",
    fullName: "Oil and Natural Gas Corporation",
    sapSystem: "SAP ERP",
  },
  {
    name: "IOCL",
    fullName: "Indian Oil Corporation Limited",
    sapSystem: "SAP ERP",
  },
  {
    name: "GAIL",
    fullName: "GAIL (India) Limited",
    sapSystem: "SAP ERP",
  },
  {
    name: "BPCL",
    fullName: "Bharat Petroleum Corporation Limited",
    sapSystem: "SAP ERP",
  },
  {
    name: "HPCL",
    fullName: "Hindustan Petroleum Corporation Limited",
    sapSystem: "SAP ERP",
  },
  {
    name: "NTPC",
    fullName: "NTPC Limited",
    sapSystem: "SAP ERP",
  },
  {
    name: "BHEL",
    fullName: "Bharat Heavy Electricals Limited",
    sapSystem: "SAP ERP",
  },
  {
    name: "SAIL",
    fullName: "Steel Authority of India Limited",
    sapSystem: "SAP ERP",
  },
];

function SAPIntegration() {
  const [selectedCPSE, setSelectedCPSE] = useState("");

  const [file, setFile] = useState(null);
  const [records, setRecords] = useState([]);

  const [status, setStatus] = useState("not-pulled");

  const [isPulling, setIsPulling] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [message, setMessage] = useState("");

  const selectedCompany = CPSE_OPTIONS.find(
    (cpse) => cpse.name === selectedCPSE
  );

  // -----------------------------
  // CPSE SELECTION
  // -----------------------------

  const handleCPSEChange = (event) => {
    const cpse = event.target.value;

    setSelectedCPSE(cpse);

    setFile(null);
    setRecords([]);
    setStatus("not-pulled");
    setMessage("");
  };

  // -----------------------------
  // FILE UPLOAD
  // -----------------------------

  const handleFileUpload = (event) => {
    const selectedFile = event.target.files[0];

    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
      setMessage("Please upload a CSV file.");
      return;
    }

    setFile(selectedFile);
    setStatus("ready");

    setMessage(
      `${selectedFile.name} uploaded successfully for ${selectedCPSE}.`
    );

    readCSV(selectedFile);
  };

  // -----------------------------
  // READ CSV
  // -----------------------------

  const readCSV = (csvFile) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target.result;

      const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      if (lines.length < 2) {
        setRecords([]);
        return;
      }

      const headers = lines[0]
        .split(",")
        .map((header) => header.trim());

      const data = lines.slice(1).map((line) => {
        const values = line.split(",");

        const record = {};

        headers.forEach((header, index) => {
          record[header] = values[index]?.trim() || "";
        });

        return record;
      });

      setRecords(data);
    };

    reader.readAsText(csvFile);
  };

  // -----------------------------
  // PULL RECORDS
  // -----------------------------

  const handlePullRecords = () => {
    if (!selectedCPSE) {
      setMessage("Please select a CPSE first.");
      return;
    }

    if (!file) {
      setMessage("Please upload a CSV file first.");
      return;
    }

    setIsPulling(true);

    setMessage(`Pulling SAP records from ${selectedCPSE}...`);

    // Temporary simulation
    setTimeout(() => {
      setIsPulling(false);

      setStatus("pulled");

      setMessage(
        `${records.length} records successfully pulled from ${selectedCPSE} SAP data.`
      );
    }, 1500);
  };

  // -----------------------------
  // UPDATE RECORDS
  // -----------------------------

  const handleUpdateRecords = () => {
    if (status !== "pulled") {
      setMessage("Please pull the records before updating them.");
      return;
    }

    setIsUpdating(true);

    setMessage(`Updating ${selectedCPSE} records in the system...`);

    // Temporary simulation
    setTimeout(() => {
      setIsUpdating(false);

      setStatus("updated");

      setMessage(
        `${selectedCPSE} records have been successfully updated.`
      );
    }, 1500);
  };

  // -----------------------------
  // RESET
  // -----------------------------

  const handleReset = () => {
    setFile(null);
    setRecords([]);
    setStatus("not-pulled");
    setMessage("");
  };

  return (
    <div className="sap-page">

      {/* PAGE HEADER */}

      <div className="sap-header">

        <div className="sap-title-row">
          <Database size={25} />

          <div>
            <h1>SAP Integration</h1>

            <p>
              Import and synchronize material records from CPSE SAP systems.
            </p>
          </div>
        </div>

      </div>


      {/* CPSE SELECTION */}

      <section className="sap-section">

        <div className="sap-section-header">

          <div>
            <h2>Select CPSE</h2>

            <p>
              Select the organization whose SAP material records you want
              to integrate.
            </p>
          </div>

        </div>


        <div className="cpse-select-wrapper">

          <label>CPSE Organization</label>

          <div className="select-container">

            <select
              value={selectedCPSE}
              onChange={handleCPSEChange}
            >
              <option value="">
                Select a CPSE
              </option>

              {CPSE_OPTIONS.map((cpse) => (
                <option
                  key={cpse.name}
                  value={cpse.name}
                >
                  {cpse.name} — {cpse.fullName}
                </option>
              ))}

            </select>

            <ChevronDown size={18} />

          </div>

        </div>

      </section>


      {/* REST OF PAGE */}

      {selectedCPSE && (
        <>

          {/* CPSE INFORMATION */}

          <section className="cpse-info">

            <div className="company-icon">
              <Database size={21} />
            </div>

            <div className="company-details">

              <span>Connected Organization</span>

              <strong>{selectedCompany.name}</strong>

              <p>{selectedCompany.fullName}</p>

            </div>

            <div className="sap-system">

              <span>SAP System</span>

              <strong>{selectedCompany.sapSystem}</strong>

            </div>

          </section>


          {/* SAP DATA SYNCHRONIZATION */}

          <section className="sap-section">

            <div className="sap-section-header">

              <div>
                <h2>SAP Data Synchronization</h2>

                <p>
                  Upload, pull and update material master records for{" "}
                  <strong>{selectedCPSE}</strong>.
                </p>
              </div>

            </div>


            <div className="sync-grid">

              {/* FILE */}

              <div className="file-selector">

                <label>Material Data</label>

                <label className="compact-upload">

                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                  />

                  <FileText size={19} />

                  <div>

                    <strong>
                      {file
                        ? file.name
                        : "Choose SAP CSV file"}
                    </strong>

                    <span>
                      {file
                        ? `${(file.size / 1024).toFixed(1)} KB`
                        : "CSV format only"}
                    </span>

                  </div>

                  <Upload size={17} />

                </label>

              </div>


              {/* PULL */}

              <div className="sync-action">

                <label>Pull Records</label>

                <button
                  className="primary-button"
                  onClick={handlePullRecords}
                  disabled={!file || isPulling}
                >

                  {isPulling ? (
                    <>
                      <RefreshCw
                        size={17}
                        className="spin"
                      />

                      Pulling...
                    </>
                  ) : (
                    <>
                      <Download size={17} />

                      Pull Records
                    </>
                  )}

                </button>

              </div>


              {/* UPDATE */}

              <div className="sync-action">

                <label>Update Records</label>

                <button
                  className="secondary-button"
                  onClick={handleUpdateRecords}
                  disabled={
                    status !== "pulled" ||
                    isUpdating
                  }
                >

                  {isUpdating ? (
                    <>
                      <RefreshCw
                        size={17}
                        className="spin"
                      />

                      Updating...
                    </>
                  ) : (
                    <>
                      <RefreshCw size={17} />

                      Update Records
                    </>
                  )}

                </button>

              </div>


              {/* RESET */}

              <div className="sync-action reset-action">

                <label>Actions</label>

                <button
                  className="reset-button"
                  onClick={handleReset}
                >
                  Reset
                </button>

              </div>

            </div>

          </section>


          {/* STATUS */}

          <section className="sap-section">

            <div className="sap-section-header">

              <div>
                <h2>Integration Status</h2>

                <p>
                  Current synchronization state for {selectedCPSE}.
                </p>
              </div>

              <div className={`status-badge ${status}`}>

                {status === "updated"
                  ? "Updated"
                  : status === "pulled"
                  ? "Records Pulled"
                  : status === "ready"
                  ? "File Ready"
                  : "Not Pulled"}

              </div>

            </div>


            <div className="status-flow">

              <StatusStep
                label="CSV Uploaded"
                active={
                  status === "ready" ||
                  status === "pulled" ||
                  status === "updated"
                }
              />

              <div className="status-line" />

              <StatusStep
                label="Records Pulled"
                active={
                  status === "pulled" ||
                  status === "updated"
                }
              />

              <div className="status-line" />

              <StatusStep
                label="Records Updated"
                active={status === "updated"}
              />

            </div>


            <div className={`status-message ${status}`}>

              {status === "updated" ||
              status === "pulled" ? (
                <CheckCircle2 size={18} />
              ) : status === "ready" ? (
                <FileText size={18} />
              ) : (
                <AlertCircle size={18} />
              )}

              <span>
                {message ||
                  `No SAP records have been pulled for ${selectedCPSE} yet.`}
              </span>

            </div>

          </section>


          {/* RECORD PREVIEW */}

          {records.length > 0 && (

            <section className="sap-section">

              <div className="sap-section-header">

                <div>
                  <h2>Material Records</h2>

                  <p>
                    Preview of records imported from {selectedCPSE}.
                  </p>
                </div>

                <div className="record-count">
                  {records.length.toLocaleString()} records
                </div>

              </div>


              <div className="record-summary">

                <div>
                  <span>CPSE</span>
                  <strong>{selectedCPSE}</strong>
                </div>

                <div>
                  <span>Records</span>
                  <strong>{records.length}</strong>
                </div>

                <div>
                  <span>Status</span>

                  <strong>
                    {status === "updated"
                      ? "Updated"
                      : status === "pulled"
                      ? "Pulled"
                      : "Ready"}
                  </strong>
                </div>

              </div>


              <div className="table-container">

                <table>

                  <thead>

                    <tr>

                      {Object.keys(records[0])
                        .slice(0, 6)
                        .map((header) => (
                          <th key={header}>
                            {header}
                          </th>
                        ))}

                    </tr>

                  </thead>

                  <tbody>

                    {records
                      .slice(0, 10)
                      .map((record, index) => (

                        <tr key={index}>

                          {Object.keys(records[0])
                            .slice(0, 6)
                            .map((header) => (

                              <td key={header}>
                                {record[header] || "-"}
                              </td>

                            ))}

                        </tr>

                      ))}

                  </tbody>

                </table>

              </div>


              {records.length > 10 && (
                <p className="table-note">
                  Showing first 10 records of{" "}
                  {records.length}.
                </p>
              )}

            </section>

          )}

        </>
      )}

    </div>
  );
}


// ---------------------------------------------
// STATUS STEP
// ---------------------------------------------

function StatusStep({ label, active }) {

  return (
    <div
      className={`status-step ${
        active ? "active" : ""
      }`}
    >

      <div className="status-circle">

        {active ? (
          <CheckCircle2 size={17} />
        ) : (
          <div className="empty-circle" />
        )}

      </div>

      <span>{label}</span>

    </div>
  );
}

export default SAPIntegration;