const request = require('supertest');
const app = require('../../app');

const { mongoConnect, mongoDisconnect } = require('../../services/mongo');
const { loadPlanetsData } = require('../../models/planets.model');
const { loadLaunchesData } = require('../../models/launches.model');

describe('All tests', () => {
    beforeAll( async () => {
        await mongoConnect();
        await loadPlanetsData();
        await loadLaunchesData();
    })
    afterAll( async () => {
        await mongoDisconnect();
    })

    describe("My first try in testing", () => {
        test('first try', async () => {
            // expect(1+1).toBe(2)
            const response = await request(app)
                .get('/launches')
                .expect('Content-Type', /json/)
                .expect(200);
        })

        test('post /launches', async () => {
            const response = await request(app)
                .post('/launches')
                .send({
                    mission: 'm1',
                    target: 'yerevan',
                    rocket: 'L90',
                    launchDate: '16 March 2024'
                });
            const reqDate = new Date('16 March 2024').valueOf();
            const resDate = new Date(response.body.launchDate).valueOf();

            expect(reqDate).toBe(resDate);
            expect(response.body).toMatchObject({
                mission: 'm1',
                target: 'yerevan',
                rocket: 'L90',
            })
        })

        test('post /launches with wrong data', async () => {
            const response = await request(app)
                .post('/launches')
                .send({
                    mission: 'm1',
                    target: 'yerevan',
                    rocket: 'L90',
                    launchDate: 'duduz'
                })
                .expect(400);

            expect(response.body).toStrictEqual({
                error: 'Invalid launch date'
            })
        })
    })
})