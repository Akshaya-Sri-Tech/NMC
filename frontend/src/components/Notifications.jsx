import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Info
} from "lucide-react";

function Notifications() {

  return (

    <div>

      <div className="page-heading">

        <div>

          <div className="eyebrow">
            SYSTEM NOTIFICATIONS
          </div>

          <h2>
            Notifications
          </h2>

          <p>
            Review platform events, mapping alerts and
            material validation requests.
          </p>

        </div>

      </div>


      <div className="notification-list">

        <Notification
          icon={<CheckCircle2 />}
          title="Material mapping completed"
          description="CPCL completed mapping for 428 material records."
          time="12 minutes ago"
        />

        <Notification
          icon={<AlertTriangle />}
          title="Duplicate material codes detected"
          description="24 records require review in the Petroleum sector."
          time="48 minutes ago"
        />

        <Notification
          icon={<Info />}
          title="Dataset synchronization"
          description="IOCL material dataset was synchronized successfully."
          time="2 hours ago"
        />

        <Notification
          icon={<Bell />}
          title="Standardization review pending"
          description="1,240 records are awaiting validation."
          time="4 hours ago"
        />

      </div>

    </div>

  );
}


function Notification({
  icon,
  title,
  description,
  time
}) {

  return (

    <div className="notification-card">

      <div className="notification-icon">
        {icon}
      </div>

      <div className="notification-content">

        <strong>
          {title}
        </strong>

        <p>
          {description}
        </p>

      </div>

      <time>
        {time}
      </time>

    </div>

  );

}


export default Notifications;