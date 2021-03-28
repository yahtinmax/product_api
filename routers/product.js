const express = require('express'),
  router = express.Router(),
  ucontr = require('../conrollers/updateController'),
  gcontr = require('../conrollers/getController'),
  uhelp = require('../expressHelper/uploadImage');

router.get('/search', async (req, res, next) => {
  try {
    const result = await gcontr.searchProducts(
      req.query.name || '',
      req.query.price || 1000000000000
    );
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const perPage = req.query.perPage || process.env.PER_PAGE;
    const page = req.query.page || 1;
    const result = await gcontr.getAllProducts(page, perPage);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await gcontr.getOneProduct(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const result = await ucontr.addNewProduct({
      name: req.body.name,
      price: req.body.price,
      amount: req.body.amount,
    });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.put('/update', async (req, res, next) => {
  try {
    const result = await ucontr.updateProduct({
      id: req.body.id,
      name: req.body.name,
      price: req.body.price,
      amount: req.body.amount,
    });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await ucontr.deleteProduct(req.params.id || '1');
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/upload/:id', uhelp.uploadImage);

module.exports = router;
