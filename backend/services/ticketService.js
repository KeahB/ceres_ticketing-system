const db = require('../database/sqlite');

const ticketService = {
  createTicket: (ticketData) => {
    const {
      ticket_id,
      distance,
      passenger_type,
      fare,
      passenger_name,
      payment_status,
      conductor_id,
      conductor_name,
      origin,
      destination,
      route_name,
    } = ticketData;
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO tickets (
          ticket_id,
          distance,
          passenger_type,
          fare,
          passenger_name,
          payment_status,
          conductor_id,
          conductor_name,
          origin,
          destination,
          route_name
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      db.run(
        query,
        [
          ticket_id,
          distance,
          passenger_type,
          fare,
          passenger_name,
          payment_status,
          conductor_id,
          conductor_name,
          origin,
          destination,
          route_name,
        ],
        function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...ticketData });
        }
        }
      );
    });
  },

  getAllTickets: () => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM tickets ORDER BY created_at DESC`;
      db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },

  getTicketById: (id) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM tickets WHERE id = ?`;
      db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  },

  getDailyReport: () => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT DATE(created_at) as date, SUM(fare) as total_earnings
        FROM tickets
        GROUP BY date
        ORDER BY date DESC
      `;
      db.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
};

module.exports = ticketService;
