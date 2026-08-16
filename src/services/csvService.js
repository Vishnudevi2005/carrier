/* =====================================================
   CSV LOADER
===================================================== */

export async function loadCSV(filePath) {
  const response = await fetch(filePath);

  if (!response.ok) {
    throw new Error(`Unable to load ${filePath}`);
  }

  const text = await response.text();

  const lines = text
    .trim()
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "");

  if (lines.length < 2) {
    return [];
  }

  const headers = lines[0]
    .replace(/^\uFEFF/, "")
    .split(",")
    .map((header) => header.trim());

  return lines.slice(1).map((line) => {
    const values = line.split(",");

    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index]
        ? values[index].trim()
        : "";
    });

    return row;
  });
}


/* =====================================================
   NORMALIZE HEADER
===================================================== */

function normalizeHeader(header) {
  return String(header)
    .toLowerCase()
    .replace(/[\s_-]+/g, "")
    .replace(/[()]/g, "");
}


/* =====================================================
   GET VALUE
===================================================== */

function getValue(row, possibleNames) {
  const normalizedRow = {};

  Object.keys(row).forEach((key) => {
    normalizedRow[normalizeHeader(key)] = row[key];
  });

  for (const name of possibleNames) {
    const normalizedName = normalizeHeader(name);

    if (
      normalizedRow[normalizedName] !== undefined &&
      normalizedRow[normalizedName] !== ""
    ) {
      return normalizedRow[normalizedName];
    }
  }

  return "";
}


/* =====================================================
   NUMBER CONVERSION
===================================================== */

function parseNumber(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return 0;
  }

  const number = String(value).match(/[\d.]+/);

  return number ? Number(number[0]) : 0;
}


/* =====================================================
   ASSIGNMENT STORAGE
   Uses browser localStorage
===================================================== */

export function getAssignments() {
  try {
    const data = localStorage.getItem(
      "carrierAssignments"
    );

    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error(
      "Unable to read assignments:",
      error
    );

    return {};
  }
}


/* =====================================================
   GET ONE ASSIGNMENT
===================================================== */

export function getAssignment(shipmentId) {
  if (!shipmentId) {
    return null;
  }

  const assignments = getAssignments();

  return assignments[shipmentId] || null;
}


/* =====================================================
   SAVE ASSIGNMENT
===================================================== */

export function saveAssignment(
  shipmentId,
  carrier
) {
  if (!shipmentId || !carrier) {
    throw new Error(
      "Shipment ID and carrier are required"
    );
  }

  const assignments = getAssignments();

  const assignment = {
    shipment_id: shipmentId,

    carrier_id: carrier.carrier_id,

    carrier_name: carrier.carrier_name,

    rate_per_kg: carrier.rate_per_kg,

    delivery_days: carrier.delivery_days,

    max_weight_kg: carrier.max_weight_kg,

    status: "Assigned",

    assigned_at: new Date().toISOString(),
  };

  assignments[shipmentId] = assignment;

  localStorage.setItem(
    "carrierAssignments",
    JSON.stringify(assignments)
  );

  return assignment;
}


/* =====================================================
   REMOVE ASSIGNMENT
===================================================== */

export function removeAssignment(shipmentId) {
  if (!shipmentId) {
    return;
  }

  const assignments = getAssignments();

  delete assignments[shipmentId];

  localStorage.setItem(
    "carrierAssignments",
    JSON.stringify(assignments)
  );
}


/* =====================================================
   GET SHIPMENTS
   Reads CSV + assignment status from localStorage
===================================================== */

export async function getShipments() {
  const data = await loadCSV("/shipments.csv");

  const assignments = getAssignments();

  return data.map((item) => {
    const shipmentId = getValue(item, [
      "shipment_id",
      "shipment id",
      "shipmentid",
      "id",
    ]);

    const customer = getValue(item, [
      "customer",
      "customer name",
      "customer_name",
    ]);

    const weightValue = getValue(item, [
      "weight",
      "weight kg",
      "weight (kg)",
      "shipment weight",
      "shipment weight kg",
    ]);

    const deliveryValue = getValue(item, [
      "required delivery",
      "required delivery days",
      "required delivery (days)",
      "delivery",
      "delivery days",
    ]);

    let status =
      getValue(item, [
        "status",
        "shipment status",
      ]) || "Pending";

    /*
      If this shipment has an assignment
      in localStorage, show Assigned.
    */

    if (
      assignments[shipmentId] &&
      assignments[shipmentId].status === "Assigned"
    ) {
      status = "Assigned";
    }

    /*
      If the CSV itself says Completed,
      keep it Completed.
    */

    const csvStatus = getValue(item, [
      "status",
      "shipment status",
    ]);

    if (
      csvStatus &&
      csvStatus.toLowerCase() === "completed"
    ) {
      status = "Completed";
    }

    return {
      shipment_id: shipmentId,

      customer: customer,

      weight: parseNumber(weightValue),

      required_delivery:
        parseNumber(deliveryValue),

      status: status,
    };
  });
}


/* =====================================================
   GET CARRIERS
===================================================== */

export async function getCarriers() {
  const data = await loadCSV("/carrier_rates.csv");

  return data.map((item) => {
    return {
      carrier_id: getValue(item, [
        "carrier_id",
        "carrier id",
        "id",
      ]),

      carrier_name: getValue(item, [
        "carrier_name",
        "carrier name",
        "name",
      ]),

      rate_per_kg: parseNumber(
        getValue(item, [
          "rate_per_kg",
          "rate per kg",
          "rate",
          "rate/kg",
        ])
      ),

      max_weight_kg: parseNumber(
        getValue(item, [
          "max_weight_kg",
          "max weight kg",
          "max weight (kg)",
          "maximum weight",
          "capacity",
          "maximum capacity",
        ])
      ),

      delivery_days: parseNumber(
        getValue(item, [
          "delivery_days",
          "delivery days",
          "delivery",
          "delivery time",
        ])
      ),
    };
  });
}


/* =====================================================
   CALCULATE BEST CARRIER
===================================================== */

export function calculateBestCarrier(
  shipment,
  carriers
) {
  if (
    !shipment ||
    !Array.isArray(carriers) ||
    carriers.length === 0
  ) {
    return null;
  }

  /*
    Carrier must satisfy:

    1. Capacity >= shipment weight
    2. Delivery days <= required delivery
  */

  const eligibleCarriers = carriers.filter(
    (carrier) => {
      const hasCapacity =
        Number(carrier.max_weight_kg) >=
        Number(shipment.weight);

      const meetsDelivery =
        Number(carrier.delivery_days) <=
        Number(shipment.required_delivery);

      return hasCapacity && meetsDelivery;
    }
  );

  if (eligibleCarriers.length === 0) {
    return null;
  }

  /*
    Select the lowest-cost eligible carrier.
  */

  return eligibleCarriers.reduce(
    (best, current) => {
      const bestCost =
        Number(best.rate_per_kg) *
        Number(shipment.weight);

      const currentCost =
        Number(current.rate_per_kg) *
        Number(shipment.weight);

      if (currentCost < bestCost) {
        return current;
      }

      return best;
    }
  );
}


/* =====================================================
   COMPARE ALL CARRIERS
===================================================== */

export function compareCarriers(
  shipment,
  carriers
) {
  if (
    !shipment ||
    !Array.isArray(carriers)
  ) {
    return [];
  }

  return carriers.map((carrier) => {
    const hasCapacity =
      Number(carrier.max_weight_kg) >=
      Number(shipment.weight);

    const meetsDelivery =
      Number(carrier.delivery_days) <=
      Number(shipment.required_delivery);

    const eligible =
      hasCapacity && meetsDelivery;

    let reason = "";

    if (eligible) {
      reason =
        "Meets shipment requirements";
    } else if (
      !hasCapacity &&
      !meetsDelivery
    ) {
      reason =
        "Insufficient capacity and delivery time is too long";
    } else if (!hasCapacity) {
      reason =
        "Carrier capacity is insufficient";
    } else if (!meetsDelivery) {
      reason =
        "Carrier delivery time is too long";
    }

    return {
      ...carrier,

      total_cost:
        Number(carrier.rate_per_kg) *
        Number(shipment.weight),

      eligible: eligible,

      reason: reason,
    };
  });
}


/* =====================================================
   GET ASSIGNED CARRIER FOR SHIPMENT
===================================================== */

export function getAssignedCarrier(shipmentId) {
  const assignment =
    getAssignment(shipmentId);

  if (!assignment) {
    return null;
  }

  return assignment;
}


/* =====================================================
   GET ASSIGNED SHIPMENTS
===================================================== */

export function getAssignedShipments() {
  const assignments =
    getAssignments();

  return Object.values(assignments);
}


/* =====================================================
   CHECK IF SHIPMENT IS ASSIGNED
===================================================== */

export function isShipmentAssigned(
  shipmentId
) {
  const assignment =
    getAssignment(shipmentId);

  return assignment !== null;
}


/* =====================================================
   MARK SHIPMENT AS COMPLETED
===================================================== */

export function markShipmentCompleted(
  shipmentId
) {
  if (!shipmentId) {
    return null;
  }

  const assignments =
    getAssignments();

  if (!assignments[shipmentId]) {
    return null;
  }

  assignments[shipmentId].status =
    "Completed";

  assignments[shipmentId].completed_at =
    new Date().toISOString();

  localStorage.setItem(
    "carrierAssignments",
    JSON.stringify(assignments)
  );

  return assignments[shipmentId];
}


/* =====================================================
   CLEAR ALL ASSIGNMENTS
   Useful for testing
===================================================== */

export function clearAllAssignments() {
  localStorage.removeItem(
    "carrierAssignments"
  );
}