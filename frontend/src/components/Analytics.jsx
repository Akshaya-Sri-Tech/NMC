import {
  TrendingUp,
  Database,
  GitMerge,
  AlertTriangle
} from "lucide-react";

function Analytics() {

  return (

    <div>

      <div className="page-heading">

        <div>

          <div className="eyebrow">
            PLATFORM ANALYTICS
          </div>

          <h2>
            Standardization Analytics
          </h2>

          <p>
            Monitor material harmonization and mapping
            activity across CPSEs.
          </p>

        </div>

      </div>


      <div className="analytics-grid">

        <AnalyticsCard
          icon={<Database />}
          title="Material Records"
          value="8,42,610"
          description="Total records indexed"
        />

        <AnalyticsCard
          icon={<GitMerge />}
          title="Mappings"
          value="6,87,420"
          description="Successfully harmonized"
        />

        <AnalyticsCard
          icon={<TrendingUp />}
          title="Coverage"
          value="81.6%"
          description="National mapping coverage"
        />

        <AnalyticsCard
          icon={<AlertTriangle />}
          title="Under Review"
          value="12,480"
          description="Records requiring validation"
        />

      </div>


      <div className="content-card analytics-chart">

        <div className="card-header">

          <div>

            <span className="card-kicker">
              SIX MONTH TREND
            </span>

            <h3>
              Mapping Activity
            </h3>

          </div>

        </div>


        <div className="chart-placeholder">

          <div className="chart-line"></div>

          <div className="chart-labels">

            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
            <span>Jul</span>
            <span>Aug</span>
            <span>Sep</span>

          </div>

        </div>

      </div>

    </div>

  );
}


function AnalyticsCard({
  icon,
  title,
  value,
  description
}) {

  return (

    <div className="analytics-card">

      <div className="analytics-icon">
        {icon}
      </div>

      <span>
        {title}
      </span>

      <strong>
        {value}
      </strong>

      <small>
        {description}
      </small>

    </div>

  );

}


export default Analytics;