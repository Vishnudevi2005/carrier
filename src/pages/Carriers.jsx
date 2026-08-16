import { useEffect, useState } from "react";
import { getCarriers } from "../services/csvService";

function Carriers() {
  const [carriers, setCarriers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadCarriers() {
      try {
        const data = await getCarriers();
        setCarriers(data);
      } catch (error) {
        console.error("Failed to load carriers:", error);
      }
    }

    loadCarriers();
  }, []);

  const filteredCarriers = carriers.filter((carrier) =>
    carrier.carrier_name
      .toLowerCase()
      .includes(search.toLowerCase()) ||
    carrier.carrier_id
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="carriers-page">

      {/* PAGE HEADER */}

      <div className="page-header">
        <div>
          <h1>Carriers</h1>
          <p>
            Manage and evaluate available transportation partners
          </p>
        </div>

        <div className="shipment-count">
          {carriers.length} Total Carriers
        </div>
      </div>


      {/* SUMMARY CARDS */}

      <div className="carrier-stats-grid">

        <div className="stat-card">
          <span>Total Carriers</span>
          <strong>{carriers.length}</strong>
          <small>Available transportation partners</small>
        </div>

        <div className="stat-card">
          <span>Average Rate</span>
          <strong>
            ₹
            {carriers.length
              ? (
                  carriers.reduce(
                    (sum, carrier) =>
                      sum + carrier.rate_per_kg,
                    0
                  ) / carriers.length
                ).toFixed(2)
              : 0}
            /kg
          </strong>
          <small>Average shipping rate</small>
        </div>

        <div className="stat-card">
          <span>Fastest Delivery</span>
          <strong>
            {carriers.length
              ? Math.min(
                  ...carriers.map(
                    (carrier) =>
                      carrier.delivery_days
                  )
                )
              : 0}{" "}
            days
          </strong>
          <small>Best available delivery time</small>
        </div>

        <div className="stat-card">
          <span>Highest Capacity</span>
          <strong>
            {carriers.length
              ? Math.max(
                  ...carriers.map(
                    (carrier) =>
                      carrier.max_weight_kg
                  )
                ).toLocaleString("en-IN")
              : 0}{" "}
            kg
          </strong>
          <small>Maximum shipment capacity</small>
        </div>

      </div>


      {/* SEARCH */}

      <div className="filter-card">

        <div className="search-box">

          <span>⌕</span>

          <input
            type="text"
            placeholder="Search by carrier ID or carrier name..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

      </div>


      {/* CARRIER TABLE */}

      <div className="shipments-card">

        <div className="table-title">

          <div>
            <h2>Carrier List</h2>

            <p>
              Available transportation partners
            </p>
          </div>

        </div>


        <div className="table-container">

          <table>

            <thead>
              <tr>
                <th>Carrier ID</th>
                <th>Carrier Name</th>
                <th>Rate / kg</th>
                <th>Maximum Capacity</th>
                <th>Delivery Time</th>
                <th>Status</th>
              </tr>
            </thead>


            <tbody>

              {filteredCarriers.map((carrier) => (

                <tr key={carrier.carrier_id}>

                  <td>
                    <strong>
                      {carrier.carrier_id}
                    </strong>
                  </td>

                  <td>
                    {carrier.carrier_name}
                  </td>

                  <td>
                    ₹{carrier.rate_per_kg}/kg
                  </td>

                  <td>
                    {carrier.max_weight_kg.toLocaleString(
                      "en-IN"
                    )}{" "}
                    kg
                  </td>

                  <td>
                    {carrier.delivery_days} days
                  </td>

                  <td>
                    <span className="status eligible">
                      Available
                    </span>
                  </td>

                </tr>

              ))}

            </tbody>

          </table>


          {filteredCarriers.length === 0 && (

            <div className="empty-state">
              No carriers found.
            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default Carriers;