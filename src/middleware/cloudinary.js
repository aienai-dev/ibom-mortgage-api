const cloudinary = require("cloudinary").v2;
var fs = require("fs");

cloudinary.config({
  cloud_name: "dzquobiiy",
  api_key: "314448274634145",
  api_secret: "b6L1U62e4WaUq6OkG_HBDUcX-VQ",
});

const cloudUpload = async (path, filename) => {
  // console.log(path);
  if (path) {
    const res = await cloudinary.uploader.upload(path, {
      resource_type: "auto",
      public_id: filename,
    });

    fs.unlink(path, (err) => {
      if (err) return;
    });
    return res;
  } else {
    return null;
  }
};

module.exports = cloudUpload;
