const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/') // save uploaded files to the 'uploads' directory
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname) // use original file name for the uploaded file
    }
  });

  const upload = multer({ storage: storage });

module.exports = {upload}