import { Search, Download, Plus } from "lucide-react";

const materials = [
  {
    code: "MAT-0001842",
    description: "Ball Bearing 6205",
    category: "Mechanical",
    cpse: "IOCL",
    status: "Mapped",
  },
  {
    code: "MAT-0001843",
    description: "Carbon Steel Pipe",
    category: "Pipeline",
    cpse: "ONGC",
    status: "Mapped",
  },
  {
    code: "MAT-0001844",
    description: "Industrial Valve",
    category: "Mechanical",
    cpse: "BPCL",
    status: "Review",
  },
  {
    code: "MAT-0001845",
    description: "Copper Cable",
    category: "Electrical",
    cpse: "NTPC",
    status: "Mapped",
  },
  {
    code: "MAT-0001846",
    description: "Pressure Gauge",
    category: "Instrumentation",
    cpse: "CPCL",
    status: "Pending",
  },
  {
    code: "MAT-0001847",
    description: "Lubricating Oil",
    category: "Consumables",
    cpse: "NLCIL",
    status: "Mapped",
  },
  {
    code: "MAT-0001848",
    description: "Gate Valve 150mm",
    category: "Mechanical",
    cpse: "HPCL",
    status: "Mapped",
  },
  {
    code: "MAT-0001849",
    description: "Electrical Transformer",
    category: "Electrical",
    cpse: "BHEL",
    status: "Review",
  },
];

function Materials() {
  return (
    <div className="materials-page">
      {/* Page heading */}
      <div className="page-heading">
        <div>
          <div className="eyebrow">MATERIAL CATALOGUE</div>

          <h2>Material Records</h2>

          <p>
            Search, review and manage standardized material
            records across connected CPSEs.
          </p>
        </div>

        <button className="primary-button">
          <Plus size={17} />
          Add Material
        </button>
      </div>

      {/* Main content */}
      <div className="content-card">
        {/* Toolbar */}
        <div className="catalogue-toolbar">
          <div className="catalogue-search">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search material code or description..."
            />
          </div>

          <button className="secondary-button">
            <Download size={16} />
            Export
          </button>
        </div>

        {/* Table */}
        <div className="data-table">
          <div className="data-row data-header">
            <span>Material Code</span>
            <span>Description</span>
            <span>Category</span>
            <span>CPSE</span>
            <span>Status</span>
          </div>

          {materials.map((material) => (
            <div
              className="data-row"
              key={material.code}
            >
              <span className="material-code">
                {material.code}
              </span>

              <span>
                {material.description}
              </span>

              <span>
                {material.category}
              </span>

              <span>
                {material.cpse}
              </span>

              <span>
                <Status status={material.status} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Status({ status }) {
  return (
    <span
      className={`status-badge status-${status.toLowerCase()}`}
    >
      {status}
    </span>
  );
}

export default Materials;