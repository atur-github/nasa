const axios = require('axios');

const Launch = require('./launches.mongo');
const Planet = require('./planets.mongo');

const DEFAULT_FLIGHT_NUMBER = 100;

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function populateLaunches() {
    const response = await axios.post(SPACEX_API_URL, {
        query: {},
        options: {
            pagination: false,
            populate: [
                {
                    path: 'rocket',
                    select: {
                        'name': 1
                    }
                },
                {
                    path: 'payloads',
                    select: {
                        'customers': 1
                    }
                }
            ]
        }
    });

    const launchDocs = response.data.docs;
    for(const launchDoc of launchDocs) {
        const payloads = launchDoc['payloads'];
        const customers = payloads.flatMap( (payload) => payload['customers']);

        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: new Date(launchDoc['date_local']),
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
            customers
        }
        await saveLaunch(launch);
    }
}

async function loadLaunchesData(){
    console.log('downloading...');
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat'
    })
    if(firstLaunch) {
        console.log('all launches have been saved')
    } else {
        await populateLaunches();
    }
}

async function getAllLaunches(skip, limit) {
    return await Launch.find({} , '-_id -__v')
        .sort({ flightNumber: 1 })
        .skip(skip)
        .limit(limit);
    // Array.from(launches.values());
}

async function findLaunch(filter) {
    return await Launch.findOne(filter);
}

async function existsLaunchWithId(id) {
    return await findLaunch({
        flightNumber: id
    });
}

async function saveLaunch(launch) {
    return await Launch.updateOne({
        flightNumber: launch.flightNumber
    }, launch, {
        upsert: true
    })
}

async function scheduleNewLaunch(_launch) {
    const planet = await Planet.findOne({
        kepler_name: _launch.target
    });
    if(!planet){
        throw new Error('target not found')
    }
    const newFlightNumber = await getLatestFlightNumber() + 1;
    const newLaunch = Object.assign(_launch, {
        success: true,
        upcoming: true,
        customers: ['Atur', 'NASA'],
        flightNumber: newFlightNumber
    });

    await saveLaunch(newLaunch);
}


async function getLatestFlightNumber() {
    const latestLaunch = await Launch
        .findOne()
        .sort({flightNumber: -1});

    if(!latestLaunch){
        return DEFAULT_FLIGHT_NUMBER;
    }

    return latestLaunch.flightNumber;
}

async function abortLaunchById(id) {
    const aborted = await Launch.updateOne({
        flightNumber: id
    }, {
        upcoming: false,
        success: false
    });

    return aborted.modifiedCount === 1;
}

module.exports = {
    loadLaunchesData,
    getAllLaunches,
    scheduleNewLaunch,
    existsLaunchWithId,
    abortLaunchById
}