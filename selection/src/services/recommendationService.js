import { getCarriers } from "./csvService";

export async function getCarrierRecommendations(shipment) {
  const carriers = await getCarriers();

  const results = carriers.map((carrier) => {

    const capacityOk =
      shipment.weight <= carrier.max_weight_kg;

    const deliveryOk =
      carrier.delivery_days <= shipment.required_delivery;

    const totalCost =
      shipment.weight * carrier.rate_per_kg;

    let status = "Eligible";
    let reason = "Meets shipment requirements";

    if (!capacityOk) {
      status = "Not Eligible";
      reason = "Shipment exceeds carrier capacity";
    } 
    else if (!deliveryOk) {
      status = "Not Eligible";
      reason = "Carrier delivery time is too long";
    }

    return {
      ...carrier,
      total_cost: totalCost,
      capacity_ok: capacityOk,
      delivery_ok: deliveryOk,
      status,
      reason
    };
  });

  const eligible = results
    .filter(carrier => carrier.status === "Eligible")
    .sort((a, b) => a.total_cost - b.total_cost);

  const recommended = eligible.length > 0
    ? eligible[0]
    : null;

  return {
    allCarriers: results,
    recommended
  };
}