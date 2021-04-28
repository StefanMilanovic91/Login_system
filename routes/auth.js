const router = require('express').Router();

const { register } = require('../controllers/auth-controller');

router.get('/register', register);