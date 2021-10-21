const mongoose = require('mongoose');

const MONGO_URL = process.env.MONGO_URL

mongoose.connection.once('open', () => {
    console.log('Successfully connected to DATABASE!');
});

mongoose.connection.on('error', (err) => {
    console.error('DATABASE is not availabe...\n', err);
})

async function mongoConnect() {
    await mongoose.connect(MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
}

async function mongoDisconnect() {
    await mongoose.disconnect();
}

module.exports = {
    mongoConnect,
    mongoDisconnect
}