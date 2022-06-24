const express = require('express');
const routerTest = express.Router();

const {getAllProducts,
    getProduct,
    createProduct,
    editProduct,
    deleteProduct
} = require('../controllers/products-test')


routerTest.route('/').get(getAllProducts).post(createProduct)
routerTest.route('/:id').get(getProduct).put(editProduct).delete(deleteProduct)


module.exports = routerTest