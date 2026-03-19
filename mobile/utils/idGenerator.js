/**
 * Generate a unique ticket ID
 * Format: CERES-YYYYMMDD-XXXX where XXXX is a random 4-char string
 */
export function generateTicketId() {
  const date = new Date();
  const datePart = date.getFullYear().toString() + 
                   (date.getMonth() + 1).toString().padStart(2, '0') + 
                   date.getDate().toString().padStart(2, '0');
  
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  
  return `CERES-${datePart}-${randomPart}`;
}
