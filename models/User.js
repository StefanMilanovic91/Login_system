const mongoose = require('mongoose');



const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        require: [true, 'User name is required!']
    },
    email: {
        type: String,
        unique: true,
        match: [
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please provide a valid email adress'
        ]
    },
    password: {
        type: String,
        require: [true, 'Password is required!']
    },
    resetPasswordToken: String,
    resetPasswordExire: Date
});

const User = mongoose.model('User', UserSchema);

module.exports = User;