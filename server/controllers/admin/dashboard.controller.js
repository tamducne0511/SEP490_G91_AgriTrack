const dashboardService = require("../../services/dashboard.service");

const getSummary = async (req, res) => {
  const summary = await dashboardService.getSummary();
  res.json({
    data: summary,
    message: "Dashboard summary retrieved successfully",
  });
};

const getHarvest = async (req, res) => {
  const { farmId, fromDate, toDate } = req.query;
  const data = await dashboardService.getHarvest(farmId, fromDate, toDate);
  res.json({
    data: data,
  });
};

const getConsumption = async (req, res) => {
  const { farmId, fromDate, toDate } = req.query;
  const data = await dashboardService.getConsumption(farmId, fromDate, toDate);
  res.json({
    data: data,
  });
};

module.exports = {
  getSummary,
  getHarvest,
  getConsumption,
};