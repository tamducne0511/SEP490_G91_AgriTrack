const path = require("path");
const multer = require("multer");

const configUploadFile = (folder) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, folder);
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, ext);
      const finalName = `${baseName}-${Date.now()}${ext}`;
      cb(null, finalName);
    },
  });

  return storage;
};

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only upload images (jpeg, jpg, png, gif)"));
  }
};

module.exports = {
  configUploadFile,
  fileFilter,
};
