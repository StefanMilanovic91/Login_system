const express = require('express');
const router = express.Router();
const { private } = require('../controllers/private-controller');
const { confirmToken } = require('../middleware/confirmToken');

router.get('/', confirmToken, private);

module.exports = router; 