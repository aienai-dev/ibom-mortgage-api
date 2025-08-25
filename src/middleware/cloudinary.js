const cloudinary = require("cloudinary").v2;
var fs = require("fs");

cloudinary.config({
  cloud_name: "dusmlurxf",
  api_key: "581668339114938",
  api_secret: "lnDuAoLliZktlcUH8JDlRnZg5nc",
});

const cloudUpload = async (path, filename) => {
  // console.log(path);
  if (path) {
    const res = await cloudinary.uploader.upload(path, {
      resource_type: "auto",
      public_id: filename,
    });

    fs.unlink(path, (err) => {
      if (err) return res
    });
    return res;
  } else {
    return null;
  }
};

module.exports = cloudUpload;
