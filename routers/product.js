const express = require('express'),
  router = express.Router(),
  ucontr = require('../conrollers/updateController'),
  gcontr = require('../conrollers/getController');

router.get('/search', gcontr.searchProducts);
router.get('/', gcontr.getAllProducts);
router.get('/:id', gcontr.getOneProduct);

router.post('/upload/:id', ucontr.uploadImage);
router.post('/', ucontr.addNewProduct);
router.put('/update', ucontr.updateProduct);
router.delete('/:id', ucontr.deleteProduct);

module.exports = router;
