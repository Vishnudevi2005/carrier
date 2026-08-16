import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getShipments,
  getCarriers,
  calculateBestCarrier,
  compareCarriers,
  saveAssignment,
  getAssignment,
} from "../services/csvService";

function Recommendations() {
  const { shipmentId } = useParams();
  const navigate = useNavigate();

  const [shipment, setShipment] = useState(null);
  const [carriers, setCarriers] = useState([]);

  const [recommendedCarrier, setRecommendedCarrier] = useState(null);
  const [comparison, setComparison] = useState([]);

  const [assigned, setAssigned] = useState(false);
  const [assignedCarrier, setAssignedCarrier] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =====================================================
     LOAD SHIPMENT + CARRIER DATA
  ===================================================== */

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const shipments = await getShipments();
        const carrierData = await getCarriers();

        const selectedShipment = shipments.find(
          (item) => item.shipment_id === shipmentId
        );

        if (!selectedShipment) {
          setError("Shipment not found.");
          return;
        }

        setShipment(selectedShipment);
        setCarriers(carrierData);

        /* -----------------------------------------------
           FIND BEST CARRIER
        ------------------------------------------------ */

        const best = calculateBestCarrier(
          selectedShipment,
          carrierData
        );

        setRecommendedCarrier(best);

        /* -----------------------------------------------
           COMPARE ALL CARRIERS
        ------------------------------------------------ */

        const comparisonData = compareCarriers(
          selectedShipment,
          carrierData
        );

        setComparison(comparisonData);

        /* -----------------------------------------------
           CHECK EXISTING ASSIGNMENT
        ------------------------------------------------ */

        const existingAssignment =
          getAssignment(selectedShipment.shipment_id);

        if (existingAssignment) {
          setAssigned(true);
          setAssignedCarrier(existingAssignment);
        }

      } catch (err) {
        console.error(
          "Failed to load recommendation:",
          err
        );

        setError(
          "Unable to load carrier recommendation."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [shipmentId]);


  /* =====================================================
     ASSIGN CARRIER
  ===================================================== */

  const handleAssignCarrier = () => {
    if (!shipment) {
      return;
    }

    if (!recommendedCarrier) {
      alert(
        "No eligible carrier is available for this shipment."
      );

      return;
    }

    try {
      const assignment = saveAssignment(
        shipment.shipment_id,
        recommendedCarrier
      );

      setAssigned(true);
      setAssignedCarrier(
        assignment || recommendedCarrier
      );

      alert(
        `${recommendedCarrier.carrier_name} assigned successfully!`
      );

    } catch (err) {
      console.error(
        "Failed to assign carrier:",
        err
      );

      alert(
        "Unable to assign carrier. Please try again."
      );
    }
  };


  /* =====================================================
     LOADING SCREEN
  ===================================================== */

  if (loading) {
    return (
      <div className="recommendation-page">

        <div className="recommendation-loading">

          <div className="loading-spinner"></div>

          <p>
            Evaluating available carriers...
          </p>

        </div>

      </div>
    );
  }


  /* =====================================================
     ERROR / SHIPMENT NOT FOUND
  ===================================================== */

  if (error || !shipment) {
    return (
      <div className="recommendation-page">

        <div className="no-carrier-card">

          <h2>
            Shipment Not Found
          </h2>

          <p>
            {error ||
              "The requested shipment could not be found."}
          </p>

          <button
            className="primary-button"
            onClick={() =>
              navigate("/shipments")
            }
          >
            ← Back to Shipments
          </button>

        </div>

      </div>
    );
  }


  /* =====================================================
     CALCULATE TOTAL COST
  ===================================================== */

  const recommendedCost = recommendedCarrier
    ? recommendedCarrier.rate_per_kg *
      shipment.weight
    : 0;


  return (
    <div className="recommendation-page">


      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="recommendation-page-header">

        <div>

          <button
            className="back-button"
            onClick={() =>
              navigate("/shipments")
            }
          >
            ← Back to Shipments
          </button>

          <h1>
            Carrier Recommendation
          </h1>

          <p>
            Intelligent carrier selection based on
            cost, capacity and delivery time
          </p>

        </div>

      </div>


      {/* =================================================
          SHIPMENT INFORMATION
      ================================================= */}

      <div className="recommendation-card">

        <div className="recommendation-card-header">

          <div>

            <h2>
              Shipment Information
            </h2>

            <p>
              Details used for carrier evaluation
            </p>

          </div>

          <span className="shipment-id-badge">
            {shipment.shipment_id}
          </span>

        </div>


        <div className="shipment-info-grid">

          <div className="info-box">

            <span>
              Shipment ID
            </span>

            <strong>
              {shipment.shipment_id}
            </strong>

          </div>


          <div className="info-box">

            <span>
              Customer
            </span>

            <strong>
              {shipment.customer}
            </strong>

          </div>


          <div className="info-box">

            <span>
              Shipment Weight
            </span>

            <strong>
              {shipment.weight.toLocaleString(
                "en-IN"
              )}{" "}
              kg
            </strong>

          </div>


          <div className="info-box">

            <span>
              Required Delivery
            </span>

            <strong>
              {shipment.required_delivery} days
            </strong>

          </div>

        </div>

      </div>


      {/* =================================================
          ASSIGNED CARRIER MESSAGE
      ================================================= */}

      {assigned && assignedCarrier && (

        <div className="assignment-success">

          <div className="success-icon">
            ✓
          </div>

          <div>

            <strong>
              Carrier Assigned Successfully
            </strong>

            <p>
              {assignedCarrier.carrier_name ||
                recommendedCarrier?.carrier_name}{" "}
              has been assigned to shipment{" "}
              {shipment.shipment_id}.
            </p>

          </div>

        </div>

      )}


      {/* =================================================
          RECOMMENDED CARRIER
      ================================================= */}

      {recommendedCarrier ? (

        <div className="recommended-card">

          {/* AI HEADER */}

          <div className="ai-label">
            ⭐ AI RECOMMENDED CARRIER
          </div>


          <h1>
            {recommendedCarrier.carrier_name}
          </h1>


          <p className="recommended-description">
            Best suitable carrier for this shipment
            based on delivery requirement, capacity
            and shipping cost.
          </p>


          {/* CARRIER STATS */}

          <div className="carrier-stats">


            <div>

              <span>
                Total Shipping Cost
              </span>

              <strong>
                ₹
                {recommendedCost.toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>


            <div>

              <span>
                Rate
              </span>

              <strong>
                ₹{recommendedCarrier.rate_per_kg}/kg
              </strong>

            </div>


            <div>

              <span>
                Delivery
              </span>

              <strong>
                {recommendedCarrier.delivery_days} days
              </strong>

            </div>


            <div>

              <span>
                Capacity
              </span>

              <strong>
                {recommendedCarrier.max_weight_kg.toLocaleString(
                  "en-IN"
                )}{" "}
                kg
              </strong>

            </div>

          </div>


          {/* RECOMMENDATION REASONS */}

          <div className="recommendation-reasons">

            <div>
              <span>✓</span>
              Meets delivery requirement
            </div>

            <div>
              <span>✓</span>
              Sufficient shipment capacity
            </div>

            <div>
              <span>✓</span>
              Lowest cost among eligible carriers
            </div>

          </div>


          {/* ASSIGN BUTTON */}

          {!assigned ? (

            <button
              className="primary-button assign-button"
              onClick={handleAssignCarrier}
            >
              Assign Carrier
            </button>

          ) : (

            <button
              className="assigned-button"
              disabled
            >
              ✓ Carrier Assigned
            </button>

          )}

        </div>

      ) : (

        /* =================================================
           NO ELIGIBLE CARRIER
        ================================================= */

        <div className="no-carrier-card">

          <div className="no-carrier-icon">
            !
          </div>

          <h2>
            No Eligible Carrier
          </h2>

          <p>
            No carrier can satisfy both the shipment
            capacity and required delivery time.
          </p>

          <div className="no-carrier-help">

            <strong>
              What can you do?
            </strong>

            <ul>

              <li>
                Check if the required delivery date
                can be extended.
              </li>

              <li>
                Check whether another carrier can
                support the shipment.
              </li>

              <li>
                Consider splitting the shipment
                into multiple deliveries.
              </li>

            </ul>

          </div>

        </div>

      )}


      {/* =================================================
          CARRIER COMPARISON
      ================================================= */}

      <div className="recommendation-card comparison-card">

        <div className="recommendation-card-header">

          <div>

            <h2>
              Carrier Comparison
            </h2>

            <p>
              Compare all available carriers
            </p>

          </div>

          <span className="carrier-count-badge">
            {carriers.length} Carriers
          </span>

        </div>


        <div className="table-container">

          <table>

            <thead>

              <tr>

                <th>
                  Carrier
                </th>

                <th>
                  Rate / kg
                </th>

                <th>
                  Total Cost
                </th>

                <th>
                  Delivery
                </th>

                <th>
                  Capacity
                </th>

                <th>
                  Status
                </th>

                <th>
                  Reason
                </th>

              </tr>

            </thead>


            <tbody>

              {comparison.length > 0 ? (

                comparison.map((carrier) => (

                  <tr
                    key={carrier.carrier_id}
                  >

                    <td>

                      <strong>
                        {carrier.carrier_name}
                      </strong>

                    </td>


                    <td>
                      ₹{carrier.rate_per_kg}
                    </td>


                    <td>

                      ₹
                      {carrier.total_cost.toLocaleString(
                        "en-IN"
                      )}

                    </td>


                    <td>
                      {carrier.delivery_days} days
                    </td>


                    <td>

                      {carrier.max_weight_kg.toLocaleString(
                        "en-IN"
                      )}{" "}
                      kg

                    </td>


                    <td>

                      {carrier.eligible ? (

                        <span className="status eligible">
                          Eligible
                        </span>

                      ) : (

                        <span className="status not-eligible">
                          Not Eligible
                        </span>

                      )}

                    </td>


                    <td className="reason-cell">
                      {carrier.reason}
                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan="7"
                    className="empty-table"
                  >
                    No carrier comparison data
                    available.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* =================================================
          DECISION LOGIC
      ================================================= */}

      <div className="decision-logic-card">

        <div className="decision-icon">
          AI
        </div>

        <div>

          <h3>
            How the recommendation works
          </h3>

          <p>
            The system evaluates every carrier against
            the shipment requirements. A carrier must
            have sufficient capacity and meet the
            required delivery time. Among eligible
            carriers, the system selects the lowest-cost
            option.
          </p>

        </div>

      </div>


    </div>
  );
}

export default Recommendations;