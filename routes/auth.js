const express = require('express');
const router = express.Router();
const { register, login, forgotpassword, resetpassword } = require('../controllers/auth-controller');

router.post('/register', register);
router.post('/login', login);
router.post('/forgotpassword', forgotpassword);
router.post('/resetpassword/:resetToken', resetpassword);

module.exports = router;