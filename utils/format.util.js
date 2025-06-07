const { LIMIT_ITEM_PER_PAGE } = require("../constants/app");

exports.formatPagination = (page, total, list) => {
  return {
    messag: "Get list successfully",
    page,
    totalItem: total,
    totalPage: Math.ceil(total / LIMIT_ITEM_PER_PAGE),
    data: list,
  };
};
