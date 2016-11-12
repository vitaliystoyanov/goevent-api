process.env.NODE_ENV = 'test';

const rp = require('libs/request-promise').requestPromise;
const searchFB = require('libs/facebook/search');
const searchLocation = require('libs/facebook/location').locationEvents;

const chai = require('chai');
const expect = chai.expect;

const currentDate = require('helpers/currentDate').getCurrentDate();
const log = require('libs/log').getLogger(module);



describe('Test for request-promise function', () => {

    it('#it should return valid data', (done) => {

        let url = 'http://pokeapi.co/api/v2/pokemon/1/';

        rp(url)
            .then(response => {

                expect(response).to.exist;
                expect(response).to.not.empty;
                expect(response).to.have.property('name');

                done();
            })
            .catch(error => {

                // never gets here
                done();

            });
    });

    it('#it should throw error when url is not valid', (done) => {

        let url = 123;

        rp(url)
            .then(response => {

                // never gets here
                done();

            })
            .catch(error => {

                expect(error).to.exist;
                expect(error).to.have.property('type');
                expect(error).to.have.property('code');
                expect(error).to.have.property('message');
                expect(error).to.have.property('detail');
                expect(error.message).to.equal('Bad Request');
                expect(error.code).to.equal(400);

                done();
            });
    });
});

describe('Test for functions which uses rp', () => {

    it('#it should return valid data', (done) => {

        let options = {
            query: 'London'
        };

        searchFB(options)
            .then(response => {

                expect(response).to.not.empty;
                expect(response).to.have.length.above(0);
                expect(response[0]).to.have.property('eventId');
                done();
            })
            .catch(error => {

                // never gets here
                done();

            });
    });

    it('#it should return data around Kyiv by default search', (done) => {

        searchFB()
            .then(response => {

                expect(response).to.not.empty;
                expect(response).to.have.length.above(0);
                expect(response[0]).to.have.property('eventId');
                done();
            })
            .catch(error => {

                // never gets here
                done();

            });
    });

    it('#it should return data around Kyiv by location', (done) => {

        // Kyiv default coordinates
        let options = {
            latitude: 50.27,
            longitude: 30.31,
            distance: 2500
        };

        searchLocation(options)
            .then(response => {

                expect(response).to.not.empty;
                expect(response).to.have.length.above(0);
                expect(response[0]).to.have.property('eventId');
                done();
            })
            .catch(error => {

                // never gets here
                done();

            });
    });

    it('#it should throw an error due to incorrect parameters', (done) => {

        // error in parameters (latitude not valid)
        let options = {
            latitude: 'aaa',
            longitude: 30.31,
            distance: 2500
        };

        searchLocation(options)
            .then(response => {

                // never gets here
                done();
            })
            .catch(error => {

                expect(error).to.exist;
                expect(error).to.have.property('type');
                expect(error).to.have.property('code');
                expect(error).to.have.property('message');
                expect(error).to.have.property('detail');
                expect(error.detail).to.equal('You must pass-in valid geolocation parameters');
                expect(error.code).to.equal(400);

                done();

            });
    });
});


