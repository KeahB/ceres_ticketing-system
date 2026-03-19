const db = require('../database/sqlite');

const getTicketByTicketId = (ticketId) =>
  new Promise((resolve, reject) => {
    db.get('SELECT * FROM tickets WHERE ticket_id = ?', [ticketId], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });

const ticketService = {
  createTicket: async (ticketData) => {
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
    const existingTicket = await getTicketByTicketId(ticket_id);
    if (existingTicket) {
      return {
        id: existingTicket.id,
        ...ticketData,
        alreadyExists: true,
      };
    }

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
          route_name,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
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
        async function onInsert(err) {
          if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
              try {
                const duplicateTicket = await getTicketByTicketId(ticket_id);
                resolve({
                  id: duplicateTicket?.id,
                  ...ticketData,
                  alreadyExists: true,
                });
                return;
              } catch (lookupError) {
                reject(lookupError);
                return;
              }
            }

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
