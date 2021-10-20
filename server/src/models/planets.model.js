const fs = require('fs');
const path = require('path');

const parse = require('csv-parse');

const Planet = require('./planets.mongo');

const habitablePlanets = [];

function isHabitablePlanet(planet) {
    return planet['koi_disposition'] === 'CONFIRMED'
    && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11
    && planet['koi_prad'] < 1.6;
}

function loadPlanetsData() {
    return new Promise( (resolve, reject) => {
        fs.createReadStream(path.join(__dirname, '..', '..', 'data', 'kepler_data.csv'))
        .pipe(parse({
            comment: '#',
            columns: true
        }))
        .on('data', async planet => {
            if(isHabitablePlanet(planet)){
                await savePlanet(planet);
            }
        })
        .on('error', err => {
            console.log(err);
            reject(err);
        })
        .on('end', async () => {
            const hbCount = (await getAllPlanets()).length;
            console.log(hbCount)
            resolve();
        })
    })
}

async function getAllPlanets() {
    return await Planet.find({});
}

async function savePlanet(data) {
    return await Planet.updateOne({
        kepler_name: data.kepler_name
    },{
        kepler_name: data.kepler_name
    }, {
        upsert: true
    })
}

module.exports = {
    loadPlanetsData,
    getAllPlanets
}