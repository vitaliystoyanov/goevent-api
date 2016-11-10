process.env.NODE_ENV = 'test';

const server = require('server').server;
require('mongoose').Promise = Promise;

const Event = require('models/Event').Event;
const UserEvent = require('models/Event').UserEvent;
const User = require('models/User');
const data = require('./data').getFakeData();

const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const assert = chai.assert;

const log = require('libs/log').getLogger(module);

chai.use(chaiHttp);

let url = "http://localhost:8000/v1.0/";

const dropUserCollection = () => {
    return new Promise((resolve, reject) => {
        User.remove({}, (error, response) => {
            if (error) {
                reject(error);
            } else {
                log.info('Users deleted from database');
                resolve(response);
            }
        });
    });
};

const dropEventCollection = () => {
    Event.remove({}, (error) => {
        if (error) {
            log.error(error);
        } else {
            log.info('Common events deleted from database');
        }
    });
};

const dropUserEventColletion = () => {
    UserEvent.remove({}, (error) => {
        if (error) {
            log.error(error);
        } else {
            log.info('User events deleted from database');
        }
    });
};

const loadEvents = (data) => {
    data.forEach((item) => {
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
        });
    });
};

const logoutUser = (done) => {
    chai.request(url)
        .post('user/logout')
        .end((error) => {
            if (error) {
                log.error(error);
            } else {
                done();
            }
        });
};

describe('User routes', () => {

    before((done) => {
        dropUserCollection()
            .then(() => dropEventCollection())
            .then(() => dropUserEventColletion())
            .then(() => loadEvents(data))
            .then(() => done())
            .catch(error => {
                log.error(error);
            });
    });

    after((done) => {
        dropUserCollection()
            .then(() => dropEventCollection())
            .then(() => dropUserEventColletion())
            .then(() => done())
            .catch(error => log.error(error));
    });

    afterEach((done) => {
        logoutUser(done);
    });

    it('#it should create new user in database', (done) => {
        let username = 'melka';
        let password = 'qwerty1234';

        User.createUser(username, password).then(() => done());
    });

    it('#it should return a unique user session', (done) => {
        chai.request(url)
            .post('user/login')
            .send({username: 'melka', password: 'qwerty1234'})
            .end((error, response) => {
                let session = response.body;
                log.info(session);

                assert(session, 'string');

                expect(session).to.not.be.empty;
                expect(session.length).to.be.above(0);

                done();
            });
    });

    it('#it should create an event for unique user', done => {
        let agent = chai.request.agent(url);

        agent
            .post('user/login')
            .send({username: 'melka', password: 'qwerty1234'})
            .then((response) => {
                let session = response.body;

                assert(session, 'string');

                expect(session).to.not.be.empty;
                expect(session.length).to.be.above(0);

                return agent
                    .post('user/events/1128201143942340')
                    .then((response) => {
                        log.info(response.body);

                        assert(response.body, 'object');

                        expect(response.body).to.not.be.empty;
                        expect(response.body).to.have.property('status', true);
                        expect(response.body).to.have.property('message', 'Successfully saved new event');

                        done();
                    });
            })
            .catch(error => {
                log.error(error);
            });
    });

    it('#it should return an event which we created above for unique user', done => {
        let agent = chai.request.agent(url);

        agent
            .post('user/login')
            .send({username: 'melka', password: 'qwerty1234'})
            .then((response) => {
                let session = response.body;

                assert(session, 'string');

                expect(session).to.not.be.empty;
                expect(session.length).to.be.above(0);

                return agent
                    .get('user/events')
                    .then((response) => {
                        let event = response.body;

                        assert(event, 'object');

                        expect(event).to.not.be.empty;
                        expect(session).to.have.length.above(0);
                        done();
                    });
            })
            .catch(error => {
                log.error(error);
            });
    });
});
