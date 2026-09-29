import { useState } from "react";
import NMCCode from "./components/NMCCode";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import PriceAnomaly from "./components/PriceAnomaly";
import Dashboard from "./components/Dashboard";
import MaterialMapping from "./components/MaterialMapping";
import Settings from "./components/Settings";
import SmartSubstitution from "./components/SmartSubstitution";
import Pending from "./components/Pending";
import HumanCheck from "./components/HumanCheck";
import DemandPrediction from "./components/DemandPrediction";
import Login from "./components/Login";
import SAPIntegration from "./components/SAPIntegration.jsx";


function App() {
  const [activePage, setActivePage] =
    useState("Dashboard");

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

    const [loggedIn, setLoggedIn] = useState(false);

  /* =========================================================
     GLOBAL SEARCH
  ========================================================= */

 const [globalSearch, setGlobalSearch] =
  useState("");

const [globalSearchTrigger, setGlobalSearchTrigger] =
  useState(0);
  const handleGlobalSearch = () => {

  if (!globalSearch.trim()) {
    return;
  }

  setActivePage("Dashboard");

  setGlobalSearchTrigger(
    (value) => value + 1
  );
};


  const renderPage = () => {

    switch (activePage) {

      case "Dashboard":
        return (
          <Dashboard
  setActivePage={setActivePage}
  globalSearch={globalSearch}
  setGlobalSearch={setGlobalSearch}
  globalSearchTrigger={globalSearchTrigger}
/>
        );
      case "SAP Integration":
        return <SAPIntegration />;

      case "Material Map Across India":
        return <MaterialMapping />;


      case "Settings":
        return <Settings />;


      case "NMC Code": return <NMCCode />;


      case "Pending":
  return <Pending />;


      case "Human Check":
  return <HumanCheck />;


      case "Price Anomaly Detection": return <PriceAnomaly />;


      case "Demand Prediction":
  return <DemandPrediction />;


      case "Smart Substitution Across CPSEs":
  return <SmartSubstitution />;


      default:
  return (
    <Dashboard
      setActivePage={setActivePage}
      globalSearch={globalSearch}
      setGlobalSearch={setGlobalSearch}
      globalSearchTrigger={globalSearchTrigger}
    />
  );
    }
  };
  if (!loggedIn) {
  return (
    <Login
      onLogin={() =>
        setLoggedIn(true)
      }
    />
  );
}


  return (
    <div className="app-shell">

      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        sidebarOpen={sidebarOpen}
      />


      <div
        className={`main-area ${
          sidebarOpen
            ? "sidebar-visible"
            : "sidebar-hidden"
        }`}
      >

        <Topbar
          activePage={activePage}
          onMenuClick={() =>
            setSidebarOpen(!sidebarOpen)
          }
          globalSearch={globalSearch}
          setGlobalSearch={setGlobalSearch}
          onGlobalSearch={handleGlobalSearch}
        />


        <main
          key={activePage}
          className="page-content"
        >
          {renderPage()}
        </main>

      </div>

    </div>
  );
}


/* =========================================================
   TEMPORARY PAGE
========================================================= */

function PlaceholderPage({
  title,
  description,
}) {
  return (
    <div className="placeholder-page">

      <div className="eyebrow">
        CPSE MATERIAL INTELLIGENCE
      </div>

      <h2>{title}</h2>

      <p>{description}</p>

    </div>
  );
}


export default App;