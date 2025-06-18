const { formatPagination } = require("../../utils/format.util");
const dashboardService = require("../../services/dashboard.service");

const getSummary = async (req, res) => {
  const summary = await dashboardService.getSummary();
  res.json({
    data: summary,
    message: "Dashboard summary retrieved successfully",
  });
};

module.exports = {
  getSummary,
};