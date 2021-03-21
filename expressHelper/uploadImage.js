const upload = require('../multerConfig'),
  models = require('../models'),
  path = require('path'),
  fs = require('fs');

module.exports = {
  uploadImage: (req, res) => {
    const id = req.params.id;

    models.Product.findById(id)
      .then((item) => {
        !item
          ? res.status(404).json({
              error: 'Product with this ObjectId is not found',
            })
          : upload(req, res, (err) => {
              const error = checkErrorCode(req, res, err);
              if (error) res.status(400).json({ error: error });
              else if (!item.path) {
                models.Product.findByIdAndUpdate(id, {
                  path: `${req.file.path}`,
                })
                  .then(() => {
                    res.status(200).json({
                      message: `Product ${id} succesfully update with image ${req.file.originalname}`,
                    });
                  })
                  .catch((err) => {
                    res.status(500).json({
                      error: 'Internal server error',
                    });
                  });
              } else {
                const filePath = path.join(
                  path.dirname(require.main.filename),
                  item.path
                );
                fs.unlinkSync(filePath);
                res.status(200).json({
                  message: `Product ${id} succesfully update with image ${req.file.originalname}`,
                });
              }
            });
      })
      .catch((err) => {
        res.status(400).json({
          error: 'Not valid ObjectId',
        });
      });
  },
};

function checkErrorCode(req, res, err) {
  let error = '';
  if (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      error = 'Image size lte 2mb';
    }
    if (err.code === 'EXTENTION') {
      error = 'Correct extension is jpeg and png';
    }
    return error;
  } else return;
}
