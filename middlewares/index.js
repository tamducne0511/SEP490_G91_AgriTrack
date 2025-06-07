const isAdmin = require("./isAdmin.middleware");
const isFarmAdmin = require("./isFarmAdmin.middleware");

module.exports = {
  isAdmin,
  isFarmAdmin,
};
