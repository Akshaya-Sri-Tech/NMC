import {
  Menu,
  Search,
  Bell,
  ChevronDown
} from "lucide-react";

function Topbar({
  activePage,
  onMenuClick,
  globalSearch,
  setGlobalSearch,
  onGlobalSearch
}) {
  return (
    <header className="topbar">

      <div className="topbar-left">

        <button
          className="menu-button"
          onClick={onMenuClick}
        >
          <Menu size={21} />
        </button>

        <div>
          <div className="breadcrumb">
            SIH / Platform
          </div>

          <h1>{activePage}</h1>
        </div>

      </div>


      <div className="topbar-right">

        <div className="global-search">

          <Search size={17} />

        <input
  value={globalSearch}
  onChange={(e) =>
    setGlobalSearch(e.target.value)
  }
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      onGlobalSearch();
    }
  }}
  placeholder="Search materials, CPSEs..."
/>

          <span>Ctrl K</span>

        </div>


        <button className="icon-button">

          <Bell size={19} />

          <i></i>

        </button>


        <div className="user-profile">

          <div className="avatar">
            SK
          </div>

          <div className="user-info">

            <strong>
              SIH Admin
            </strong>

            <span>
              Administrator
            </span>

          </div>

          <ChevronDown size={16} />

        </div>

      </div>

    </header>
  );
}

export default Topbar;