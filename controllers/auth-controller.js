const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

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
        const foundUser = await User.findOne({ email }).select('+password');
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

exports.forgotpassword = async (req, res) => {

    try {

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, error: 'Email could not be sent.' });
        }

        // find user
        const foundUser = await User.findOne({ email }).select('-password');

        if (!foundUser) {
            return res.status(400).json({ success: false, error: 'Invalid credentials.' });
        }

        // create resetToken
        const resetToken = crypto.randomBytes(20).toString('hex');
        const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // add expiration on current time
        let expirationTime = Date.now() + 10 * 60000;

        foundUser.resetPasswordToken = hashedResetToken;
        foundUser.resetPasswordExpire = expirationTime;
        
        await foundUser.save();

        // send reset url to email

        try {
            const resetURL = `http://localhost:8626/user/passwordreset/${resetToken}`;

            const transporter = nodemailer.createTransport({
                service: process.env.EMAIL_SERVICE,
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD
                }
            });

            const message = `<h1>You have requested a password reset.</h1>

                            <p>Go to the address below and reset password!</p>

                            <a href=${resetURL} clicktracking=off>${resetURL}</a>
            `

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: foundUser.email,
                subject: 'Password reset request',
                html: message 
            };

            await transporter.sendMail(mailOptions);

            return res.status(200).json({ success: true, data: 'Email sent' });

        } catch (error) {
            foundUser.resetPasswordToken = undefined;
            foundUser.resetPasswordExpire = undefined;
            await foundUser.save();
            
            console.log(error);

            return errorResponse(res, 500, 'Email could not be sent.');
        }

    } catch (error) {
        return errorResponse(res, 500, error.message);
    }

}

exports.resetpassword = async (req, res) => {

    try {

        const { password } = req.body;

        const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');
        
        const userFound = await User.findOne({ resetPasswordToken });

        if (!userFound) {
            return errorResponse(res, 400, 'Invalid reset URL');
        }

        if (Date.now() > userFound.resetPasswordExpire) {
            userFound.resetPasswordToken = undefined;
            userFound.resetPasswordExpire = undefined;
            await userFound.save();
            return errorResponse(res, 400, 'Your reset URL has expired');
        }
 
        // hash and save new password

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        userFound.password = hashedPassword;
        userFound.resetPasswordToken = undefined;
        userFound.resetPasswordExpire = undefined;
        await userFound.save();
        
        res.status(200).json({ success: true, data: 'Password reset is successful' });
        
        
    } catch (error) {
        return errorResponse(res, 500, error.message);
    }

}

const errorResponse = (res, statusCode, message) => {
    res.status(statusCode).json({ success: false, error: message });
}