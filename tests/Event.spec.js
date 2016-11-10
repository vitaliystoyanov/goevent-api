process.env.NODE_ENV = 'test';

const server = require('server').server;

const Event = require('models/Event').Event;
const data = require('./data').getFakeData();

const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const assert = chai.assert;

const log = require('libs/log').getLogger(module);

chai.use(chaiHttp);

const dropEventCollection = (done) => {
    Event.remove({}, (error) => {
        if (error) {
            log.error(error);
        } else {
            log.info('Test database dropped');
            done();
        }
    });
};

const loadEvents = (data, done) => {
    data.forEach((item, index) => {
        let event = new Event({
            eventPicture: item.eventPicture,
            eventId: item.eventId,
            eventName: item.eventName,
            eventDescription: item.eventDescription,
            eventCategory: item.eventCategory,
            eventStartTime: item.eventStartTime,
            eventEndTime: item.eventEndTime,
            eventLocation: item.eventLocation
        });

        event.save((error) => {
            if (error) {
                log.error(error);
            }

            log.info('Test event saved in database');

            if (index === data.length - 1) {
                done();
            }
        });
    });
};

describe('Common routes', () => {

    let url = "http://localhost:8000/v1.0/";

    before((done) => {
        loadEvents(data, done);
    });

    after((done) => {
        dropEventCollection(done);
    });

    // note that this tests will take place only if in app.js file will be commented out rendering error page (:84:86)
    describe('Non existing page', () => {
        it('#it should return error of not existing route', done => {
            chai.request(url)
                .get('my-not-existing-page')
                .end((error, response) => {
                    let errorObj = response.body;

                    assert.isObject(errorObj, 'response is an object');

                    expect(errorObj).to.not.be.empty;
                    expect(response.status).to.be.equal(errorObj.code);
                    expect(response.status).to.be.equal(404);
                    expect(errorObj).to.include.keys('name', 'type', 'code', 'message', 'detail');

                    expect(errorObj).to.have.property('message', 'Page not found');
                    expect(errorObj).to.have.property('detail', 'The page you were trying to open could not be found');

                    done();
                });
        });
    });

    describe('Events requests', () => {
        it('#it should return all events from database', done => {
            chai.request(url)
                .get('events')
                .end((error, response) => {
                    assert.isArray(response.body.events, 'response is an array');

                    expect(response.body.events).to.not.be.empty;
                    expect(response.status).to.be.equal(200);
                    expect(response.body.events.length).to.be.above(0);
                    expect(response.body).to.have.property('count');

                    done();
                });
        });


        it('#it should return two events by parameters from database', done => {
            let parameters = {};
            parameters.limit = 2;
            parameters.offset = 0;

            chai.request(url)
                .get('events?limit=' + parameters.limit + '&offset=' + parameters.offset)
                .end((error, response) => {
                    assert.isArray(response.body.events, 'response is an array');

                    expect(response.body.events).to.not.be.empty;
                    expect(response.status).to.be.equal(200);
                    expect(response.body.events.length).to.eql(2);

                    done();
                });
        });

        it('#it should return an error for not number queries', done => {
            let query = {
                limit: 'limit',
                offset: 'offset'
            };

            chai.request(url)
                .get('events?limit=' + query.limit + '&offset=' + query.offset)
                .end((error, response) => {
                    let errorObj = response.body;

                    assert.isObject(errorObj, 'response is an object');

                    expect(errorObj).to.not.be.empty;
                    expect(response.status).to.be.equal(400);
                    expect(errorObj).to.have.property('code', 400);
                    expect(errorObj).to.have.property('message', 'Bad Request');
                    expect(errorObj).to.have.property('detail', 'You must pass-in valid skip and limit parameters');

                    done();
                });
        });

        it('#it should return an event by the given id', done => {
            let id = 191873531241841;

            chai.request(url)
                .get('events/'.concat(id))
                .end((error, response) => {
                    assert.isObject(response.body, 'response is an object');

                    expect(response.body).to.not.be.empty;
                    expect(response.status).to.be.equal(200);
                    expect(response.body).to.include.keys('eventId', 'eventPicture', 'eventName', 'eventDescription', 'eventStartTime', 'eventEndTime', 'eventLocation');
                    expect(typeof response.body.eventDescription).to.equal('string');

                    done();
                });
        });

        it('#it should return an error for not existing event id', done => {
            let id = 11111111111111111;

            chai.request(url)
                .get('events/'.concat(id))
                .end((error, response) => {
                    let errorObj = response.body;

                    assert.isObject(response.body, 'response is an object');

                    expect(response.status).to.be.equal(404);
                    expect(errorObj).to.have.property('code', 404);
                    expect(errorObj).to.have.property('message', 'Not Found');

                    done();
                });
        });

        it('#it should return an error for not number parameter of event id', done => {
            let id = 'qwerty';

            chai.request(url)
                .get('events/'.concat(id))
                .end((error, response) => {
                    let errorObj = response.body;

                    assert.isObject(response.body, 'response is an object');

                    expect(errorObj).to.not.be.empty;
                    expect(response.status).to.be.equal(400);
                    expect(errorObj).to.have.property('code', 400);
                    expect(errorObj).to.have.property('message', 'Bad Request');

                    done();
                });
        });
    });


    describe('Location requests', () => {
        it('#it should return events by Kyiv location coordinates', done => {
            let location = {};

            location.lat = '50.43';
            location.lng = '30.52';
            location.distance = '4000';
            let params = "lat=" + location.lat + "&lng=" + location.lng + "&distance=" + location.distance;

            chai.request(url)
                .get('events-location?'.concat(params))
                .end((error, response) => {
                    assert.isArray(response.body.events, 'response is an array');

                    expect(response.body.events).to.not.be.empty;
                    expect(response.status).to.be.equal(200);
                    expect(response.body.events.length).to.be.above(0);

                    done();
                });
        });

        it('#it should return an error for not number parameter of location', done => {
            let location = {};

            location.lat = 'lat';
            location.lng = 'lng';
            location.distance = '4000';
            let params = "lat=" + location.lat + "&lng=" + location.lng + "&distance=" + location.distance;

            chai.request(url)
                .get('events-location?'.concat(params))
                .end((error, response) => {
                    let errorObj = response.body;

                    assert.isObject(response.body, 'response is an object');

                    expect(errorObj).to.not.be.empty;
                    expect(response.status).to.be.equal(400);
                    expect(errorObj).to.have.property('message', 'Bad Request');

                    done();
                });
        });
    });
});
