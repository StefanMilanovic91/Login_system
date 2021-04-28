const mongoose = require('mongoose');

const connectDB = async () => {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });
    console.log('Connected with DB');
}

module.exports = connectDB;