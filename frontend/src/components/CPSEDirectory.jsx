import { Building2, MapPin } from "lucide-react";

import { cpseData } from "../data/cpseData";

function CPSEDirectory() {

  return (

    <div>

      <div className="page-heading">

        <div>

          <div className="eyebrow">
            ORGANIZATION DIRECTORY
          </div>

          <h2>
            CPSE Directory
          </h2>

          <p>
            Connected Central Public Sector Enterprises
            participating in the platform.
          </p>

        </div>

      </div>


      <div className="cpse-directory-grid">

        {cpseData.map((cpse) => (

          <div
            className="cpse-card"
            key={cpse.id}
          >

            <div className="cpse-card-top">

              <div className="large-cpse-icon">
                <Building2 size={21} />
              </div>

              <span className="active-label">
                Active
              </span>

            </div>

            <h3>
              {cpse.name}
            </h3>

            <div className="cpse-short">
              {cpse.shortName}
            </div>

            <div className="cpse-location">

              <MapPin size={14} />

              {cpse.city}, {cpse.state}

            </div>

            <div className="cpse-card-footer">

              <div>
                <strong>
                  {cpse.materials.toLocaleString()}
                </strong>

                <span>
                  Materials
                </span>
              </div>

              <div>
                <strong>
                  {cpse.mapped.toLocaleString()}
                </strong>

                <span>
                  Mapped
                </span>
              </div>

            </div>

          </div>

        ))}

      </div>

    </div>

  );
}

export default CPSEDirectory;