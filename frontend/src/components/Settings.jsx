import { useState } from "react";

import {
  Settings as SettingsIcon,
  Building2,
  Database,
  Bell,
  SlidersHorizontal,
  UserRound,
  RefreshCw,
  Save,
  RotateCcw,
  CheckCircle2,
  Server,
  ShieldCheck,
} from "lucide-react";

function Settings() {
  const [settings, setSettings] = useState({
    organization: "CPSE Material Intelligence",
    currency: "INR (₹)",
    dateFormat: "DD/MM/YYYY",
    timeZone: "Asia/Kolkata",

    matchingThreshold: "85",
    compatibilityThreshold: "80",
    anomalyThreshold: "20",
    predictionPeriod: "30",

    priceAlerts: true,
    pendingAlerts: true,
    humanCheckAlerts: true,
    systemAlerts: true,

    compactTable: false,
    autoRefresh: true,
    confirmActions: true,
  });

  const [saved, setSaved] = useState(false);

  const updateSetting = (key, value) => {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));

    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const handleReset = () => {
    setSettings({
      organization: "CPSE Material Intelligence",
      currency: "INR (₹)",
      dateFormat: "DD/MM/YYYY",
      timeZone: "Asia/Kolkata",

      matchingThreshold: "85",
      compatibilityThreshold: "80",
      anomalyThreshold: "20",
      predictionPeriod: "30",

      priceAlerts: true,
      pendingAlerts: true,
      humanCheckAlerts: true,
      systemAlerts: true,

      compactTable: false,
      autoRefresh: true,
      confirmActions: true,
    });

    setSaved(false);
  };

  return (
    <div className="settings-page">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="settings-page-header">

        <div>
          <div className="settings-eyebrow">
            SYSTEM ADMINISTRATION
          </div>

          <h2>Settings</h2>

          <p>
            Configure system preferences, material
            intelligence rules and notification controls.
          </p>
        </div>

        <div className="settings-header-status">
          <CheckCircle2 size={16} />
          <span>System Operational</span>
        </div>

      </div>

      {/* =================================================
          MAIN SETTINGS GRID
      ================================================= */}

      <div className="settings-layout">

        {/* =================================================
            SYSTEM CONFIGURATION
        ================================================= */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-card-icon">
              <Building2 size={18} />
            </div>

            <div>
              <h3>System Configuration</h3>
              <span>
                General application and regional settings
              </span>
            </div>

          </div>

          <div className="settings-form-grid">

            <div className="settings-field">
              <label>Organization</label>

              <input
                value={settings.organization}
                onChange={(event) =>
                  updateSetting(
                    "organization",
                    event.target.value
                  )
                }
              />
            </div>

            <div className="settings-field">
              <label>Currency</label>

              <select
                value={settings.currency}
                onChange={(event) =>
                  updateSetting(
                    "currency",
                    event.target.value
                  )
                }
              >
                <option>INR (₹)</option>
                <option>USD ($)</option>
                <option>EUR (€)</option>
              </select>
            </div>

            <div className="settings-field">
              <label>Date Format</label>

              <select
                value={settings.dateFormat}
                onChange={(event) =>
                  updateSetting(
                    "dateFormat",
                    event.target.value
                  )
                }
              >
                <option>DD/MM/YYYY</option>
                <option>MM/DD/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </div>

            <div className="settings-field">
              <label>Time Zone</label>

              <select
                value={settings.timeZone}
                onChange={(event) =>
                  updateSetting(
                    "timeZone",
                    event.target.value
                  )
                }
              >
                <option>Asia/Kolkata</option>
                <option>UTC</option>
                <option>Asia/Singapore</option>
              </select>
            </div>

          </div>

        </section>


        {/* =================================================
            MATERIAL INTELLIGENCE
        ================================================= */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-card-icon">
              <SlidersHorizontal size={18} />
            </div>

            <div>
              <h3>Material Intelligence</h3>
              <span>
                Configure matching and detection thresholds
              </span>
            </div>

          </div>

          <div className="settings-form-grid">

            <div className="settings-field">

              <label>
                NMC Matching Threshold
              </label>

              <div className="settings-input-suffix">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.matchingThreshold}
                  onChange={(event) =>
                    updateSetting(
                      "matchingThreshold",
                      event.target.value
                    )
                  }
                />
                <span>%</span>
              </div>

              <small>
                Minimum similarity required for material
                code matching.
              </small>

            </div>

            <div className="settings-field">

              <label>
                Substitution Compatibility
              </label>

              <div className="settings-input-suffix">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.compatibilityThreshold}
                  onChange={(event) =>
                    updateSetting(
                      "compatibilityThreshold",
                      event.target.value
                    )
                  }
                />
                <span>%</span>
              </div>

              <small>
                Minimum compatibility score for substitution.
              </small>

            </div>

            <div className="settings-field">

              <label>
                Price Anomaly Threshold
              </label>

              <div className="settings-input-suffix">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.anomalyThreshold}
                  onChange={(event) =>
                    updateSetting(
                      "anomalyThreshold",
                      event.target.value
                    )
                  }
                />
                <span>%</span>
              </div>

              <small>
                Price deviation used to flag anomalies.
              </small>

            </div>

            <div className="settings-field">

              <label>
                Demand Prediction Period
              </label>

              <div className="settings-input-suffix">
                <input
                  type="number"
                  min="7"
                  max="365"
                  value={settings.predictionPeriod}
                  onChange={(event) =>
                    updateSetting(
                      "predictionPeriod",
                      event.target.value
                    )
                  }
                />
                <span>days</span>
              </div>

              <small>
                Forecast horizon for demand prediction.
              </small>

            </div>

          </div>

        </section>


        {/* =================================================
            NOTIFICATIONS
        ================================================= */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-card-icon">
              <Bell size={18} />
            </div>

            <div>
              <h3>Notifications</h3>
              <span>
                Control system alerts and operational notifications
              </span>
            </div>

          </div>

          <div className="settings-toggle-list">

            <div className="settings-toggle-row">

              <div>
                <strong>Price Anomaly Alerts</strong>
                <span>
                  Notify when unusual material pricing is detected.
                </span>
              </div>

              <button
                className={`settings-toggle ${
                  settings.priceAlerts
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  updateSetting(
                    "priceAlerts",
                    !settings.priceAlerts
                  )
                }
              >
                <span />
              </button>

            </div>


            <div className="settings-toggle-row">

              <div>
                <strong>Pending Task Alerts</strong>
                <span>
                  Notify users about pending standardization tasks.
                </span>
              </div>

              <button
                className={`settings-toggle ${
                  settings.pendingAlerts
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  updateSetting(
                    "pendingAlerts",
                    !settings.pendingAlerts
                  )
                }
              >
                <span />
              </button>

            </div>


            <div className="settings-toggle-row">

              <div>
                <strong>Human Check Alerts</strong>
                <span>
                  Notify reviewers when manual verification is required.
                </span>
              </div>

              <button
                className={`settings-toggle ${
                  settings.humanCheckAlerts
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  updateSetting(
                    "humanCheckAlerts",
                    !settings.humanCheckAlerts
                  )
                }
              >
                <span />
              </button>

            </div>


            <div className="settings-toggle-row">

              <div>
                <strong>System Notifications</strong>
                <span>
                  Receive important system and service notifications.
                </span>
              </div>

              <button
                className={`settings-toggle ${
                  settings.systemAlerts
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  updateSetting(
                    "systemAlerts",
                    !settings.systemAlerts
                  )
                }
              >
                <span />
              </button>

            </div>

          </div>

        </section>


        {/* =================================================
            USER PREFERENCES
        ================================================= */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-card-icon">
              <UserRound size={18} />
            </div>

            <div>
              <h3>User Preferences</h3>
              <span>
                Configure the application interface behaviour
              </span>
            </div>

          </div>

          <div className="settings-toggle-list">

            <div className="settings-toggle-row">

              <div>
                <strong>Compact Table View</strong>
                <span>
                  Display more records within table views.
                </span>
              </div>

              <button
                className={`settings-toggle ${
                  settings.compactTable
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  updateSetting(
                    "compactTable",
                    !settings.compactTable
                  )
                }
              >
                <span />
              </button>

            </div>


            <div className="settings-toggle-row">

              <div>
                <strong>Automatic Refresh</strong>
                <span>
                  Automatically refresh dashboard data.
                </span>
              </div>

              <button
                className={`settings-toggle ${
                  settings.autoRefresh
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  updateSetting(
                    "autoRefresh",
                    !settings.autoRefresh
                  )
                }
              >
                <span />
              </button>

            </div>


            <div className="settings-toggle-row">

              <div>
                <strong>Confirm Before Actions</strong>
                <span>
                  Ask for confirmation before important changes.
                </span>
              </div>

              <button
                className={`settings-toggle ${
                  settings.confirmActions
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  updateSetting(
                    "confirmActions",
                    !settings.confirmActions
                  )
                }
              >
                <span />
              </button>

            </div>

          </div>

        </section>


        {/* =================================================
            SYSTEM INFORMATION
        ================================================= */}

        <section className="settings-card settings-system-card">

          <div className="settings-card-header">

            <div className="settings-card-icon">
              <Database size={18} />
            </div>

            <div>
              <h3>System Information</h3>
              <span>
                Current application and service status
              </span>
            </div>

          </div>

          <div className="settings-system-grid">

            <div className="settings-system-item">
              <Server size={16} />
              <div>
                <span>Backend API</span>
                <strong>Operational</strong>
              </div>
            </div>

            <div className="settings-system-item">
              <Database size={16} />
              <div>
                <span>Database</span>
                <strong>Connected</strong>
              </div>
            </div>

            <div className="settings-system-item">
              <ShieldCheck size={16} />
              <div>
                <span>Security</span>
                <strong>Active</strong>
              </div>
            </div>

            <div className="settings-system-item">
              <RefreshCw size={16} />
              <div>
                <span>Last Sync</span>
                <strong>Just now</strong>
              </div>
            </div>

          </div>

          <div className="settings-version">
            CPSE Material Intelligence • SIH v1.0.0
          </div>

        </section>

      </div>


      {/* =================================================
          ACTION BAR
      ================================================= */}

      <div className="settings-action-bar">

        <button
          className="settings-reset-button"
          onClick={handleReset}
        >
          <RotateCcw size={15} />
          Reset
        </button>

        <button
          className="settings-save-button"
          onClick={handleSave}
        >
          <Save size={15} />

          {saved
            ? "Changes Saved"
            : "Save Changes"}
        </button>

      </div>

    </div>
  );
}

export default Settings;