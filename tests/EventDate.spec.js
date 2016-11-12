process.env.NODE_ENV = 'test';

const searchLocation = require('libs/facebook/location').locationEvents;

const chai = require('chai');
const expect = chai.expect;

const currentDate = require('helpers/currentDate').getCurrentDate();
const log = require('libs/log').getLogger(module);

function testCycle(currentDay, day) {
    describe('Event end date', () => {
        it('#it should return true that currentDay must be less than day', () => {
            expect(currentDay <= day).to.equal(true);
        });
    });
}

describe('Events location test', () => {
    it('#it should return events by valid date', (done) => {

        // error in parameters (latitude not valid)
        let params = {
            latitude: 50.43,
            longitude: 30.52,
            distance: 2500
        };

        let options = {
            since: currentDate,
            until: '2016-11-28'
        };

        let date = options.until.split('-');
        let day = date[2];

        searchLocation(params, options)
            .then(response => {

                response.forEach(event => {
                    let eventDate = event.eventEndTime.split('-');
                    let eventDay = eventDate[2].split('T');
                    eventDay = eventDay[0];

                    testCycle(eventDay, day);
                });

                done();
            })
            .catch(error => {

                // never gets here
                done();

            });
    });
});
