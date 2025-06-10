const isAdmin = require("./isAdmin.middleware");
const isExpert = require("./isExpert.middleware");
const isFarmAdmin = require("./isFarmAdmin.middleware");
const isFarmer = require("./isFarmer.middleware");
const isLogin = require("./isLogin.middleware");
const isRoles = require("./isRoles.middleware");

module.exports = {
  isAdmin,
  isFarmAdmin,
  isFarmer,
  isLogin,
  isExpert,
  isRoles,
};
