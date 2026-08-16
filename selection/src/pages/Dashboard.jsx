import { useEffect, useState } from "react";
import { getShipments, getCarriers } from "../services/csvService";

function Dashboard() {
  const [shipments, setShipments] = useState([]);
  const [carriers, setCarriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const shipmentData = await getShipments();
        const carrierData = await getCarriers();

        setShipments(shipmentData);
        setCarriers(carrierData);
      } catch (err) {
        console.error(err);
        setError("Unable to load shipment data.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const totalShipments = shipments.length;
  const totalCarriers = carriers.length;

  const pendingShipments = shipments.filter(
    shipment =>
      !shipment.status ||
      shipment.status.toLowerCase() === "pending"
  ).length;

  const completedShipments = shipments.filter(
    shipment =>
      shipment.status &&
      shipment.status.toLowerCase() === "completed"
  ).length;

  const totalWeight = shipments.reduce(
    (total, shipment) =>
      total + Number(shipment.weight || 0),
    0
  );

  if (loading) {
    return (
      <div className="loading-screen">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-card">
        {error}
      </div>
    );
  }

  return (
    <div className="dashboard">

      {/* HEADER */}

      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>
            Monitor shipments and optimize carrier selection
          </p>
        </div>

        <div className="dashboard-date">
          Transportation Management
        </div>
      </div>


      {/* KPI CARDS */}

      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-icon blue">
            S
          </div>

          <div>
            <p>Total Shipments</p>
            <h2>{totalShipments}</h2>
            <span>All shipments</span>
          </div>
        </div>


        <div className="stat-card">
          <div className="stat-icon purple">
            C
          </div>

          <div>
            <p>Total Carriers</p>
            <h2>{totalCarriers}</h2>
            <span>Available carriers</span>
          </div>
        </div>


        <div className="stat-card">
          <div className="stat-icon orange">
            P
          </div>

          <div>
            <p>Pending Shipments</p>
            <h2>{pendingShipments}</h2>
            <span>Require action</span>
          </div>
        </div>


        <div className="stat-card">
          <div className="stat-icon green">
            ✓
          </div>

          <div>
            <p>Completed</p>
            <h2>{completedShipments}</h2>
            <span>Delivered shipments</span>
          </div>
        </div>

      </div>


      {/* SECONDARY KPI */}

      <div className="secondary-card">

        <div>
          <p>Total Shipment Weight</p>
          <h2>{totalWeight.toLocaleString()} kg</h2>
        </div>

        <div>
          <p>Average Shipment Weight</p>
          <h2>
            {totalShipments
              ? Math.round(totalWeight / totalShipments)
              : 0}{" "}
            kg
          </h2>
        </div>

        <div>
          <p>Carrier Availability</p>
          <h2>{totalCarriers} carriers</h2>
        </div>

      </div>


      {/* MAIN GRID */}

      <div className="dashboard-grid">

        {/* RECENT SHIPMENTS */}

        <div className="dashboard-card shipments-card">

          <div className="card-header">

            <div>
              <h2>Recent Shipments</h2>
              <p>Latest shipment activity</p>
            </div>

            <a href="/shipments">
              View All
            </a>

          </div>


          <div className="table-container">

            <table>

              <thead>
                <tr>
                  <th>Shipment ID</th>
                  <th>Customer</th>
                  <th>Weight</th>
                  <th>Delivery</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>

                {shipments.slice(0, 5).map((shipment, index) => (

                  <tr key={index}>

                    <td>
                      <strong>
                        {shipment.shipment_id}
                      </strong>
                    </td>

                    <td>
                      {shipment.customer}
                    </td>

                    <td>
                      {shipment.weight} kg
                    </td>

                    <td>
                      {shipment.required_delivery} days
                    </td>

                    <td>
                      <span className="status pending">
                        Pending
                      </span>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>


        {/* CARRIER OVERVIEW */}

        <div className="dashboard-card">

          <div className="card-header">

            <div>
              <h2>Carrier Overview</h2>
              <p>Available transportation partners</p>
            </div>

            <a href="/carriers">
              View All
            </a>

          </div>


          <div className="carrier-list">

            {carriers.map((carrier, index) => (

              <div
                className="carrier-item"
                key={index}
              >

                <div className="carrier-info">

                  <div className="carrier-logo">
                    {carrier.carrier_id?.replace("C", "")}
                  </div>

                  <div>
                    <strong>
                      {carrier.carrier_name}
                    </strong>

                    <span>
                      {carrier.delivery_days} days delivery
                    </span>
                  </div>

                </div>

                <div className="carrier-rate">
                  ₹{carrier.rate_per_kg}/kg
                </div>

              </div>

            ))}

          </div>

        </div>

      </div>


      {/* RECOMMENDATION */}

      <div className="recommendation-banner">

        <div className="recommendation-icon">
          AI
        </div>

        <div className="recommendation-content">

          <h2>
            Intelligent Carrier Recommendation
          </h2>

          <p>
            Compare carrier cost, delivery time and
            shipment capacity to select the most suitable
            transportation partner.
          </p>

        </div>

        <a
          href="/recommendations"
          className="recommendation-button"
        >
          View Recommendations
        </a>

      </div>

    </div>
  );
}

export default Dashboard;