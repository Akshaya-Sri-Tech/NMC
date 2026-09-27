import {
  LayoutDashboard,
  Hash,
  Clock3,
  UserCheck,
  Map,
  TrendingDown,
  Brain,
  Repeat2,
  Settings,
  Database,
} from "lucide-react";

const menuItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "NMC Code",
    icon: Hash,
  },
  {
    name: "Pending",
    icon: Clock3,
  },
  {
    name: "Human Check",
    icon: UserCheck,
  },
  {
    name: "Material Map Across India",
    icon: Map,
  },
  {
    name: "Price Anomaly Detection",
    icon: TrendingDown,
  },
  {
    name: "Demand Prediction",
    icon: Brain,
  },
  {
    name: "Smart Substitution Across CPSEs",
    icon: Repeat2,
  },
  {
    name: "Settings",
    icon: Settings,
  },
];

function Sidebar({
  activePage,
  setActivePage,
  sidebarOpen,
}) {
  return (
    <aside
      className={`sidebar ${
        sidebarOpen ? "open" : "closed"
      }`}
    >

      {/* =================================================
          BRAND
      ================================================= */}

      <div className="brand">

        <div className="brand-mark">
          <Database size={22} />
        </div>

        <div className="brand-text">
          <strong>CPSE</strong>
          <span>Material Intelligence</span>
        </div>

      </div>


      {/* =================================================
          NAVIGATION
      ================================================= */}

      <div className="nav-section-title">
        PLATFORM
      </div>

      <nav className="sidebar-nav">

        {menuItems.map((item) => {

          const Icon = item.icon;

          return (
            <button
              key={item.name}
              className={`nav-item ${
                activePage === item.name
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActivePage(item.name)
              }
              title={item.name}
            >

              <Icon size={19} />

              <span>
                {item.name}
              </span>

            </button>
          );

        })}

      </nav>


      {/* =================================================
          FOOTER
      ================================================= */}

      <div className="sidebar-footer">

        <div className="system-status">

          <span className="status-dot"></span>

          <div>
            <strong>
              System Operational
            </strong>

            <small>
              All services running
            </small>
          </div>

        </div>

        <div className="version">
          SIH • v1.0.0
        </div>

      </div>

    </aside>
  );
}

export default Sidebar;