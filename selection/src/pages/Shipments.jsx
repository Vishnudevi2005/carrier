import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getShipments } from "../services/csvService";

function Shipments() {
  const navigate = useNavigate();

  const [shipments, setShipments] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // LOAD SHIPMENTS FROM CSV
  // ==========================================

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        const data = await getShipments();

        setShipments(data);
      } catch (error) {
        console.error("Failed to load shipments:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // ==========================================
  // SEARCH + STATUS FILTER
  // ==========================================

  const filteredShipments = shipments.filter((shipment) => {
    const searchText = search.toLowerCase().trim();

    const shipmentId = String(
      shipment.shipment_id || ""
    ).toLowerCase();

    const customer = String(
      shipment.customer || ""
    ).toLowerCase();

    const shipmentStatus = String(
      shipment.status || "Pending"
    );

    const matchesSearch =
      shipmentId.includes(searchText) ||
      customer.includes(searchText);

    const matchesStatus =
      statusFilter === "All" ||
      shipmentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // ==========================================
  // OPEN SHIPMENT DETAILS
  // ==========================================

  const handleViewShipment = (shipment) => {
    setSelectedShipment(shipment);
  };

  // ==========================================
  // OPEN RECOMMENDATION PAGE
  // ==========================================

  const handleFindBestCarrier = () => {
    if (!selectedShipment) {
      return;
    }

    navigate(
      `/recommendations?shipment=${selectedShipment.shipment_id}`
    );
  };

  // ==========================================
  // CLOSE DETAILS
  // ==========================================

  const handleCloseDetails = () => {
    setSelectedShipment(null);
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="loading-page">
        <div className="loading-box">
          <div className="loading-spinner"></div>

          <h2>Loading Shipments</h2>

          <p>
            Reading shipment information...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="shipments-page">

      {/* ======================================
          PAGE HEADER
      ====================================== */}

      <div className="page-header">

        <div>
          <h1>Shipments</h1>

          <p>
            Manage and evaluate customer shipments
          </p>
        </div>

        <div className="shipment-count">
          {shipments.length} Total Shipments
        </div>

      </div>


      {/* ======================================
          SEARCH + FILTER
      ====================================== */}

      <div className="filter-card">

        <div className="search-box">

          <span className="search-icon">
            ⌕
          </span>

          <input
            type="text"
            placeholder="Search by shipment ID or customer..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>


        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >

          <option value="All">
            All Status
          </option>

          <option value="Pending">
            Pending
          </option>

          <option value="Assigned">
            Assigned
          </option>

          <option value="Completed">
            Completed
          </option>

        </select>

      </div>


      {/* ======================================
          SHIPMENT TABLE
      ====================================== */}

      <div className="shipments-card">

        <div className="table-title">

          <div>

            <h2>
              Shipment List
            </h2>

            <p>
              Select a shipment to evaluate
              carrier options
            </p>

          </div>

        </div>


        <div className="table-container">

          <table>

            <thead>

              <tr>

                <th>
                  Shipment ID
                </th>

                <th>
                  Customer
                </th>

                <th>
                  Weight
                </th>

                <th>
                  Required Delivery
                </th>

                <th>
                  Status
                </th>

                <th>
                  Action
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredShipments.map(
                (shipment) => (

                  <tr
                    key={
                      shipment.shipment_id
                    }
                  >

                    {/* SHIPMENT ID */}

                    <td>

                      <strong>
                        {shipment.shipment_id}
                      </strong>

                    </td>


                    {/* CUSTOMER */}

                    <td>
                      {shipment.customer}
                    </td>


                    {/* WEIGHT */}

                    <td>

                      {shipment.weight} kg

                    </td>


                    {/* DELIVERY */}

                    <td>

                      {shipment.required_delivery}
                      {" "}
                      days

                    </td>


                    {/* STATUS */}

                    <td>

                      <span
                        className={`status ${
                          String(
                            shipment.status ||
                            "Pending"
                          ).toLowerCase()
                        }`}
                      >

                        {shipment.status ||
                          "Pending"}

                      </span>

                    </td>


                    {/* ACTION */}

                    <td>

                      <button
                        className="view-button"
                        onClick={() =>
                          handleViewShipment(
                            shipment
                          )
                        }
                      >
                        View
                      </button>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>


          {/* NO RESULTS */}

          {filteredShipments.length === 0 && (

            <div className="empty-state">

              <div className="empty-icon">
                📦
              </div>

              <h3>
                No shipments found
              </h3>

              <p>
                Try changing your search or
                status filter.
              </p>

            </div>

          )}

        </div>

      </div>


      {/* ======================================
          SHIPMENT DETAILS
      ====================================== */}

      {selectedShipment && (

        <div className="shipment-details">


          {/* DETAILS HEADER */}

          <div className="details-header">

            <div>

              <h2>
                Shipment Details
              </h2>

              <p>
                Review shipment information before
                selecting a carrier
              </p>

            </div>


            <button
              className="close-button"
              onClick={
                handleCloseDetails
              }
              aria-label="Close shipment details"
            >
              ×
            </button>

          </div>


          {/* ==================================
              DETAILS GRID
          ================================== */}

          <div className="details-grid">


            {/* SHIPMENT ID */}

            <div className="detail-item">

              <span>
                Shipment ID
              </span>

              <strong>
                {selectedShipment.shipment_id}
              </strong>

            </div>


            {/* CUSTOMER */}

            <div className="detail-item">

              <span>
                Customer
              </span>

              <strong>
                {selectedShipment.customer}
              </strong>

            </div>


            {/* WEIGHT */}

            <div className="detail-item">

              <span>
                Shipment Weight
              </span>

              <strong>
                {selectedShipment.weight} kg
              </strong>

            </div>


            {/* DELIVERY */}

            <div className="detail-item">

              <span>
                Required Delivery
              </span>

              <strong>
                {selectedShipment.required_delivery}
                {" "}
                days
              </strong>

            </div>


            {/* STATUS */}

            <div className="detail-item">

              <span>
                Current Status
              </span>

              <strong>
                {selectedShipment.status ||
                  "Pending"}
              </strong>

            </div>


            {/* CUSTOMER + SHIPMENT TYPE */}

            <div className="detail-item">

              <span>
                Shipment Type
              </span>

              <strong>
                Customer Delivery
              </strong>

            </div>

          </div>


          {/* ==================================
              RECOMMENDATION ACTION
          ================================== */}

          <div className="recommendation-action">

            <div>

              <div className="ai-label">
                AI CARRIER SELECTION
              </div>

              <h3>
                Ready to select a carrier?
              </h3>

              <p>
                Compare available carriers based
                on capacity, delivery time and cost.
              </p>

            </div>


            <button
  className="primary-button"
  onClick={() =>
    navigate(
      `/recommendations/${selectedShipment.shipment_id}`
    )
  }
>
  Find Best Carrier
</button>

          </div>

        </div>

      )}

    </div>
  );
}

export default Shipments;