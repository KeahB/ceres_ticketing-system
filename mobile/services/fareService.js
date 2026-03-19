import { getDistance } from '../data/municipalities';

/**
 * LTFRB Based Fare Calculation
 * Regular fare = ₱2.70 per km
 * Discounted fare (Student, Senior, PWD) = ₱2.16 per km (20% discount)
 */

export const REGULAR_RATE = 2.70;
export const DISCOUNT_RATE = 2.16;

/**
 * Round to nearest ₱0.25
 */
export function roundToNearest25Centavos(amount) {
  return Math.round(amount * 4) / 4;
}

/**
 * Calculate fare based on from/to municipalities
 */
export function calculateFareByRoute(from, to, passengerType) {
  const distance = getDistance(from, to);
  
  let rate = REGULAR_RATE;
  if (passengerType !== "regular") {
    rate = DISCOUNT_RATE;
  }

  const rawFare = distance * rate;
  const roundedFare = roundToNearest25Centavos(rawFare);

  return {
    distance,
    ratePerKm: rate,
    rawFare: rawFare,
    roundedFare: roundedFare
  };
}
