const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {

    const { username, email, password } = req.body;

    try{

        // check user data
        if(!username.trim() || !email.trim() || !password.trim()){
            return res.status(400).json({ success: false, error: 'Please add user name, email and password!' });
        }

        // check user existing
        const foundUser = await User.findOne({email});
        if (foundUser) {
            return res.status(400).json({ success: false, error: 'User already exists.' });
        }

        // password encryption
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // create user
        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        // save new user
        await newUser.save();

        // create and send token
        const payload = { user_id: newUser._id };
        jwt.sign(payload, process.env.JWT_SECRET_CODE, { expiresIn: 3600 }, (err, token) => {
            if (err) throw err;
            res.status(200).json({ success: true, token });
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, error: error.message });
    }

    

}

exports.login = async (req, res) => {

    const { email, password } = req.body;

    try {

        // init check
        if (!email.trim() || !password.trim()) {
            return errorResponse(res, 400, 'Invalid credentials.');
        }

        // find user
        const foundUser = await User.findOne({ email });
        if (!foundUser) {
            return errorResponse(res, 400, 'Invalid credentials.');
        }

        // password check
        const isMatch = await bcrypt.compare(password, foundUser.password);
        if (!isMatch) {
            return errorResponse(res, 401, 'Invalid credentials.');
        }

        // create and send token
        const payload = {
            user_id: foundUser._id,
            username: foundUser.username
        };

        jwt.sign(payload, process.env.JWT_SECRET_CODE, { expiresIn: 3600 }, (err, token) => {
            if (err) throw err;
            res.status(200).json({ success: true, token });
        });


    } catch (error) {
        return errorResponse(res, 500, error.message);
    }

}

const errorResponse = (res, statusCode, message) => {
    res.status(statusCode).json({ success: false, error: message });
}