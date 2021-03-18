const multer = require('multer'),
  path = require('path');

const storage = multer.diskStorage({
  destination: 'public/images',
  filename: function (req, file, callback) {
    callback(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
      const err = new Error('Extention');
      err.code = 'EXTENTION';
      return cb(err);
    }
    cb(null, true);
  },
}).single('filedata');

module.exports = upload;
