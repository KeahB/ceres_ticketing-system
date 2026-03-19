const ticketService = require('../services/ticketService');

const reportController = {
  getDailyReport: async (req, res, next) => {
    try {
      const report = await ticketService.getDailyReport();
      res.status(200).json(report);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = reportController;
