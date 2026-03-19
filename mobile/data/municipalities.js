/**
 * Negros Oriental Municipalities and Cities
 * distance: Relative distance from Dumaguete City in km
 */
export const MUNICIPALITIES = [
  { name: "Canlaon City", distance: 165, region: "North" },
  { name: "Vallehermoso", distance: 145, region: "North" },
  { name: "Guihulngan City", distance: 116, region: "North" },
  { name: "La Libertad", distance: 106, region: "North" },
  { name: "Jimalalud", distance: 99, region: "North" },
  { name: "Tayasan", distance: 91, region: "North" },
  { name: "Ayungon", distance: 82, region: "North" },
  { name: "Bindoy", distance: 71, region: "North" },
  { name: "Manjuyod", distance: 58, region: "North" },
  { name: "Bais City", distance: 45, region: "North" },
  { name: "Tanjay City", distance: 30, region: "North" },
  { name: "Amlan", distance: 21, region: "North" },
  { name: "San Jose", distance: 14, region: "North" },
  { name: "Sibulan", distance: 6, region: "North" },
  { name: "Dumaguete City", distance: 0, region: "Capital" },
  { name: "Bacong", distance: -8, region: "South" },
  { name: "Dauin", distance: -15, region: "South" },
  { name: "Zamboanguita", distance: -28, region: "South" },
  { name: "Siaton", distance: -50, region: "South" },
  { name: "Sta. Catalina", distance: -94, region: "South" },
  { name: "Bayawan City", distance: -102, region: "South" },
  { name: "Basay", distance: -122, region: "South" },
];

/**
 * Calculate distance between two municipalities
 * @param {string} fromName 
 * @param {string} toName 
 * @returns {number} distance in km
 */
export function getDistance(fromName, toName) {
  const from = MUNICIPALITIES.find(m => m.name === fromName);
  const to = MUNICIPALITIES.find(m => m.name === toName);
  
  if (!from || !to) return 0;
  
  return Math.abs(to.distance - from.distance);
}
