var express = require('express');
const mongoose = require("mongoose");
const cors = require('cors');
const bodyParser = require('body-parser')
require('dotenv').config();

const port = process.env.PORT || 3000; // Default port is 3000 if PORT is not defined
const dbUrl = process.env.DB_URL;


var app = express();

app.use(express.json());

mongoose.connect(dbUrl);

mongoose.connection.on('connected', () => {
    app.use(express.static('browser'))

    app.listen(port, () => console.log('server started'))
    console.log('mongoose connected');
});

mongoose.connection.on('error', (err) => {
    console.log('mongoose error', err);
});

app.use(cors());
app.use('/product',require('./routes/productRoutes'));
app.use('/api/auth',require('./routes/authRoutes'));

app.use(bodyParser.json());
