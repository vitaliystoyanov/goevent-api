const app = require('../app');
const assert = require('assert');
const should = require('should');
const supertest = require('supertest');

describe('GET /events', () => {

    it('should return all saved events from database', (done) => {
        supertest(app)
            .get('/v1.0/events')
            .expect(200)
            .end((error, res) => {
                res.status.should.equal(200);
                // res.body.events.should.have.length(131);
                done();
            });
    });

    it('should return limit of events by offset', (done) => {
        supertest(app)
            .get('/v1.0/events?offset=0&limit=50')
            .expect(200)
            .end((error, res) => {
                res.status.should.equal(200);
                res.body.events.should.have.length(50);
                done();
            });
    });

    it('should return an error for a invalid event id', (done) => {
        let id = 11111111111111111;
        supertest(app)
            .get('/v1.0/events/'.concat(id))
            .expect(404)
            .end((error, res) => {
                res.status.should.equal(404);
                done();
            });
    });

});

describe('GET /events-location', () => {

    it('should return an events by location suround Kyiv', (done) => {
        let location = {};

        location.lat = '50.43';
        location.lng = '30.52';
        location.distance = '4000';
        let params = "lat=" + location.lat + "&lng=" + location.lng + "&distance=" + location.distance;

        supertest(app)
            .get('/v1.0/events-location?'.concat(params))
            .expect(200)
            .end((error, res) => {
                res.status.should.equal(200);
                done();
            });
    });
});

