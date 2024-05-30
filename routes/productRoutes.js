const router = require('express').Router()
const productController = require('../controllers/productController');
const authenticateToken = require('../common/verifyAuth');


router.post('/', authenticateToken.authenticateToken , productController.createProduct);



module.exports = router;