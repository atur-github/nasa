const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    kepler_name: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Planet', schema);