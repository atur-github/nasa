const http = require('http');

const { loadPlanetsData } = require('./models/planets.model');
const { loadLaunchesData } = require('./models/launches.model');
const { mongoConnect } = require('./services/mongo')

const app = require('./app');

const server = http.createServer(app);

const PORT = process.env.PORT || 8000;

async function startServer() {
    await mongoConnect();
    await loadPlanetsData();
    await loadLaunchesData();

    server.listen(PORT, () => {
        console.log(`api is ronning on port: ${PORT}`);
    });
}

startServer();