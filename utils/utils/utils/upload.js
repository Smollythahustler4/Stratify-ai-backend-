const multer = require("multer");
const config = require("./config");

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: config.maxFileSizeBytes },
});

module.exports = upload;
