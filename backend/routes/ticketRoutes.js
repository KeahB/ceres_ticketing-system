const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { requireAdminAuth, requireConductorAuth } = require('../middleware/auth');

router.post('/', requireConductorAuth, ticketController.createTicket);
router.get('/', requireAdminAuth, ticketController.getAllTickets);
router.get('/:id', requireAdminAuth, ticketController.getTicketById);

module.exports = router;
