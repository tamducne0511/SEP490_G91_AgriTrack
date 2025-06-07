const { body } = require("express-validator");

const create = [
  body("equipmentId").notEmpty().withMessage("EquipmentId is required"),
  body("type")
    .isIn(["import", "export"])
    .withMessage("Type must be either 'import' or 'export'"),
  body("quantity")
    .isNumeric()
    .withMessage("Quantity must be number")
    .notEmpty()
    .withMessage("Quantity is required"),
  body("price")
    .isNumeric()
    .withMessage("Price must be number")
    .notEmpty()
    .withMessage("Price is required"),
  ,
];

module.exports = {
  create,
};
