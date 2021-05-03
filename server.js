const express = require('express');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// connect with db
connectDB();

// middlewares
app.use(express.json());

// routes
app.use('/user', require('./routes/auth'));
app.use('/private', require('./routes/private'));


const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log('Start server on port ' + PORT);
});

process.on('unhandledRejection', (err, promise) => {
    console.log(`Logged Error: ${err}`);
    server.close(() => process.exit(1));
})