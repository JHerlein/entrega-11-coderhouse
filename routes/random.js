const express = require('express');
const routerRandom = express.Router();

const {random} = require('../controllers/random')


routerRandom.route('/randoms').get(random)


module.exports = routerRandom