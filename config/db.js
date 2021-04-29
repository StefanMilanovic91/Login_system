const mongoose = require('mongoose');

const connectDB = async () => {
    await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    });
    console.log('Connected with DB');
}

module.exports = connectDB;