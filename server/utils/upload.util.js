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

module.exports = {
  configUploadFile,
};
