import { useEffect, useState } from "react";
import { getShipments, getCarriers } from "../services/csvService";

function Analytics() {
  const [shipments, setShipments] = useState([]);
  const [carriers, setCarriers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    try {
      setLoading(true);

      const shipmentData = await getShipments();
      const carrierData = await getCarriers();

      setShipments(shipmentData);
      setCarriers(carrierData);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  }

  /* ================================
     SHIPMENT CALCULATIONS
  ================================= */

  const totalShipments = shipments.length;

  const pendingShipments = shipments.filter(
    (shipment) =>
      shipment.status?.toLowerCase() === "pending"
  ).length;

  const completedShipments = shipments.filter(
    (shipment) =>
      shipment.status?.toLowerCase() === "completed"
  ).length;

  /*
    A shipment is considered eligible if
    at least one carrier can:
    1. Handle the shipment weight
    2. Deliver within required delivery time
  */

  const eligibleShipments = shipments.filter((shipment) => {
    return carriers.some(
      (carrier) =>
        carrier.max_weight_kg >= shipment.weight &&
        carrier.delivery_days <= shipment.required_delivery
    );
  }).length;

  /* ================================
     CARRIER CALCULATIONS
  ================================= */

  const totalCarriers = carriers.length;

  const averageRate =
    totalCarriers > 0
      ? carriers.reduce(
          (sum, carrier) => sum + carrier.rate_per_kg,
          0
        ) / totalCarriers
      : 0;

  const fastestDelivery =
    totalCarriers > 0
      ? Math.min(
          ...carriers.map(
            (carrier) => carrier.delivery_days
          )
        )
      : 0;

  const highestCapacity =
    totalCarriers > 0
      ? Math.max(
          ...carriers.map(
            (carrier) => carrier.max_weight_kg
          )
        )
      : 0;

  /* ================================
     SORTED DATA FOR CHARTS
  ================================= */

  const carriersByRate = [...carriers].sort(
    (a, b) => a.rate_per_kg - b.rate_per_kg
  );

  const carriersByDelivery = [...carriers].sort(
    (a, b) => a.delivery_days - b.delivery_days
  );

  /* ================================
     LOADING
  ================================= */

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-loading">
          Loading analytics...
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">

      {/* ================================
          HEADER
      ================================= */}

      <div className="analytics-header">

        <div>
          <h1>Analytics</h1>

          <p>
            Monitor shipment performance and carrier
            optimization
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={loadAnalytics}
        >
          ↻ Refresh Data
        </button>

      </div>


      {/* ================================
          KPI CARDS
      ================================= */}

      <div className="analytics-kpi-grid">

        <div className="analytics-kpi-card">
          <div className="kpi-icon shipment-icon">
            S
          </div>

          <div>
            <span>Total Shipments</span>
            <strong>{totalShipments}</strong>
            <small>All shipments</small>
          </div>
        </div>


        <div className="analytics-kpi-card">
          <div className="kpi-icon carrier-icon">
            C
          </div>

          <div>
            <span>Total Carriers</span>
            <strong>{totalCarriers}</strong>
            <small>Available transportation partners</small>
          </div>
        </div>


        <div className="analytics-kpi-card">
          <div className="kpi-icon eligible-icon">
            ✓
          </div>

          <div>
            <span>Eligible Shipments</span>
            <strong>{eligibleShipments}</strong>
            <small>Can be assigned a carrier</small>
          </div>
        </div>


        <div className="analytics-kpi-card">
          <div className="kpi-icon pending-icon">
            P
          </div>

          <div>
            <span>Pending Shipments</span>
            <strong>{pendingShipments}</strong>
            <small>Require action</small>
          </div>
        </div>

      </div>


      {/* ================================
          SECONDARY KPI ROW
      ================================= */}

      <div className="analytics-summary">

        <div>
          <span>Average Carrier Rate</span>

          <strong>
            ₹{averageRate.toFixed(2)}/kg
          </strong>
        </div>


        <div>
          <span>Fastest Delivery</span>

          <strong>
            {fastestDelivery} days
          </strong>
        </div>


        <div>
          <span>Highest Capacity</span>

          <strong>
            {highestCapacity.toLocaleString()} kg
          </strong>
        </div>

      </div>


      {/* ================================
          MAIN ANALYTICS GRID
      ================================= */}

      <div className="analytics-grid">


        {/* CARRIER RATE */}

        <div className="analytics-card">

          <div className="analytics-card-header">

            <div>
              <h2>Carrier Rate Comparison</h2>

              <p>
                Shipping cost per kilogram
              </p>
            </div>

          </div>


          <div className="bar-chart">

            {carriersByRate.map((carrier) => {

              const percentage =
                averageRate > 0
                  ? (carrier.rate_per_kg /
                      Math.max(
                        ...carriers.map(
                          (c) => c.rate_per_kg
                        )
                      )) *
                    100
                  : 0;

              return (
                <div
                  className="bar-row"
                  key={carrier.carrier_id}
                >

                  <div className="bar-label">
                    <span>
                      {carrier.carrier_name}
                    </span>

                    <strong>
                      ₹{carrier.rate_per_kg}/kg
                    </strong>
                  </div>

                  <div className="bar-background">

                    <div
                      className="bar-fill"
                      style={{
                        width: `${percentage}%`,
                      }}
                    ></div>

                  </div>

                </div>
              );
            })}

          </div>

        </div>


        {/* DELIVERY PERFORMANCE */}

        <div className="analytics-card">

          <div className="analytics-card-header">

            <div>
              <h2>Delivery Performance</h2>

              <p>
                Carrier delivery time comparison
              </p>
            </div>

          </div>


          <div className="delivery-list">

            {carriersByDelivery.map((carrier, index) => (

              <div
                className="delivery-row"
                key={carrier.carrier_id}
              >

                <div className="delivery-rank">
                  {index + 1}
                </div>

                <div className="delivery-info">

                  <strong>
                    {carrier.carrier_name}
                  </strong>

                  <span>
                    Maximum capacity:{" "}
                    {carrier.max_weight_kg.toLocaleString()} kg
                  </span>

                </div>

                <div className="delivery-time">
                  {carrier.delivery_days}{" "}
                  <small>days</small>
                </div>

              </div>

            ))}

          </div>

        </div>

      </div>


      {/* ================================
          SHIPMENT ANALYSIS
      ================================= */}

      <div className="analytics-card shipment-analysis">

        <div className="analytics-card-header">

          <div>
            <h2>Shipment Status Analysis</h2>

            <p>
              Current shipment distribution
            </p>
          </div>

        </div>


        <div className="status-analysis">

          <div className="status-item">

            <div className="status-title">
              <span className="status-dot pending-dot"></span>
              Pending
            </div>

            <strong>
              {pendingShipments}
            </strong>

            <div className="status-progress">

              <div
                style={{
                  width:
                    totalShipments > 0
                      ? `${(pendingShipments /
                          totalShipments) *
                          100}%`
                      : "0%",
                }}
              ></div>

            </div>

          </div>


          <div className="status-item">

            <div className="status-title">
              <span className="status-dot completed-dot"></span>
              Completed
            </div>

            <strong>
              {completedShipments}
            </strong>

            <div className="status-progress">

              <div
                style={{
                  width:
                    totalShipments > 0
                      ? `${(completedShipments /
                          totalShipments) *
                          100}%`
                      : "0%",
                }}
              ></div>

            </div>

          </div>


          <div className="status-item">

            <div className="status-title">
              <span className="status-dot eligible-dot"></span>
              Eligible
            </div>

            <strong>
              {eligibleShipments}
            </strong>

            <div className="status-progress">

              <div
                style={{
                  width:
                    totalShipments > 0
                      ? `${(eligibleShipments /
                          totalShipments) *
                          100}%`
                      : "0%",
                }}
              ></div>

            </div>

          </div>

        </div>

      </div>


      {/* ================================
          BUSINESS INSIGHT
      ================================= */}

      <div className="insight-card">

        <div className="insight-icon">
          AI
        </div>

        <div className="insight-content">

          <h2>Optimization Insight</h2>

          <p>
            <strong>
              {carriers.length > 0
                ? carriersByRate[0].carrier_name
                : "No carrier"}
            </strong>{" "}
            offers the lowest shipping rate at{" "}
            <strong>
              ₹
              {carriers.length > 0
                ? carriersByRate[0].rate_per_kg
                : 0}
              /kg
            </strong>
            , while{" "}
            <strong>
              {carriers.length > 0
                ? carriersByDelivery[0].carrier_name
                : "No carrier"}
            </strong>{" "}
            provides the fastest delivery at{" "}
            <strong>
              {fastestDelivery} day
              {fastestDelivery !== 1 ? "s" : ""}
            </strong>.
          </p>

          <p className="insight-secondary">

            The carrier recommendation engine evaluates
            shipment weight, required delivery time,
            carrier capacity and shipping cost before
            selecting the most suitable carrier.

          </p>

        </div>

      </div>


      {/* ================================
          CARRIER TABLE
      ================================= */}

      <div className="analytics-card">

        <div className="analytics-card-header">

          <div>
            <h2>Carrier Performance Overview</h2>

            <p>
              Complete carrier information from CSV data
            </p>
          </div>

        </div>


        <div className="analytics-table-container">

          <table className="analytics-table">

            <thead>

              <tr>
                <th>Carrier</th>
                <th>Rate / kg</th>
                <th>Capacity</th>
                <th>Delivery</th>
                <th>Performance</th>
              </tr>

            </thead>


            <tbody>

              {carriers.map((carrier) => (

                <tr key={carrier.carrier_id}>

                  <td>
                    <strong>
                      {carrier.carrier_name}
                    </strong>
                  </td>

                  <td>
                    ₹{carrier.rate_per_kg}/kg
                  </td>

                  <td>
                    {carrier.max_weight_kg.toLocaleString()} kg
                  </td>

                  <td>
                    {carrier.delivery_days} days
                  </td>

                  <td>

                    {carrier.delivery_days ===
                    fastestDelivery ? (
                      <span className="performance-badge fastest">
                        Fastest
                      </span>
                    ) : carrier.rate_per_kg ===
                      Math.min(
                        ...carriers.map(
                          (c) => c.rate_per_kg
                        )
                      ) ? (
                      <span className="performance-badge lowest">
                        Lowest Cost
                      </span>
                    ) : (
                      <span className="performance-badge normal">
                        Available
                      </span>
                    )}

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default Analytics;