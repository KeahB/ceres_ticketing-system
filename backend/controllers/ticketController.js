const ticketService = require('../services/ticketService');

const ticketController = {
  createTicket: async (req, res, next) => {
    try {
      const { ticket_id, distance, passenger_type, fare, passenger_name, payment_status, origin, destination, route_name } = req.body;
      if (!ticket_id || !distance || !passenger_type || !fare || !passenger_name) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const ticket = await ticketService.createTicket({
        ticket_id,
        distance,
        passenger_type,
        fare,
        passenger_name,
        payment_status: payment_status || 'unpaid',
        origin: origin || '',
        destination: destination || '',
        route_name: route_name || [origin, destination].filter(Boolean).join(' to '),
        conductor_id: req.auth?.conductorId || null,
        conductor_name: req.auth?.name || 'Unknown',
      });
      res.status(201).json(ticket);
    } catch (err) {
      next(err);
    }
  },

  getAllTickets: async (req, res, next) => {
    try {
      const tickets = await ticketService.getAllTickets();
      res.status(200).json(tickets);
    } catch (err) {
      next(err);
    }
  },

  getTicketById: async (req, res, next) => {
    try {
      const id = req.params.id;
      const ticket = await ticketService.getTicketById(id);
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }
      res.status(200).json(ticket);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = ticketController;
