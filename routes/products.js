const express = require('express');
const router = express.Router();

const {getAllProducts,
    getProduct,
    createProduct,
    editProduct,
    deleteProduct
} = require('../controllers/products')


router.route('/').get(getAllProducts).post(createProduct)
router.route('/:id').get(getProduct).put(editProduct).delete(deleteProduct)


module.exports = router