const multer = require("multer");
const sharp = require("sharp");
const path = require("path");

const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // console.log("for destination", file);
    cb(null, "./pub/images/");
  },
  filename: function (req, file, cb) {
    // console.log("for file name", file);
    const uniqeSuffix = Date.now() + "-" + Math.round(Math.random());
    cb(null, +"fha-" + uniqeSuffix + file.originalname);
  },
});

const multerFilter = (req, file, cb) => {
  // console.log(file);
  if (
    file.mimetype.includes("image") ||
    file.mimetype.includes("application/")
  ) {
    cb(null, true);
  } else {
    cb({ message: "Unsupported file format" }, false);
  }
  // cb(null, true);
};

const uploadImage = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fieldSize: 1024 * 1024 * 3 },
});



module.exports = uploadImage;
