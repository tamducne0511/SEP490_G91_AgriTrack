const multer = require("multer");
const fs = require("fs");
const path = require("path");

const uploadWithFolder = (folder) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadPath = path.join(__dirname, "..", "uploads", folder);
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      const name = file.fieldname + "-" + Date.now() + ext;
      cb(null, name);
    },
  });

  const upload = multer({ storage });

  return {
    single: (fieldName) => {
      return (req, res, next) => {
        upload.single(fieldName)(req, res, function (err) {
          if (err) return next(err);
          next();
        });
      };
    },
  };
};

module.exports = uploadWithFolder;
