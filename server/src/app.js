const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config({path: path.join(__dirname, '.env')});

const v1Routes = require('./routes/v1');

const app = express();

// CORS Policy
app.use(cors({
    origin: 'http://localhost:3000'
}))

app.use(morgan('tiny'));

// Built-in middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')))

// Routers
app.use('/v1', v1Routes);
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
})

module.exports = app;