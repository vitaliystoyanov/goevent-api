const server = require('server').server;
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const expect = chai.expect;

const config = require('config');
const mongoose = require('mongoose');
const log = require('libs/log').getLogger(module);

chai.use(chaiHttp);

describe('Setup routing', function() {
  var url = "http://localhost:8000";

  before(done => {
    var connection = mongoose.createConnection(config.get('mongoose:testdb'));
    done();
  });

// note that this test will take place only if in app.js file will be commented out rendering error page (:84:86)
  describe('Route', () => {
    it('#it should return error of not existing route', done => {
      chai.request(url)
      .get('/v1.0/my-not-existing-page')
      .end((error, response) => {
        console.log(response.body);
        response.should.have.status(404);
        response.body.should.be.a('object');
        response.body.should.have.property('message').eql('Page not found');
        response.body.should.have.property('detail').eql('The page you were trying to open could not be found');
        done();
      });
    });
  })

  describe('Events', () => {
    it('#it should GET all events', done => {
      chai.request(url)
      .get('/v1.0/events')
      .end((error, response) => {
        response.should.have.status(200);
        response.body.events.should.be.a('array');
        expect(response.body.events.length).to.be.above(100);
        done();
      });
    });

    it('#it should GET two events by parameters', done => {
      chai.request(url)
      .get('/v1.0/events?limit=2&offset=0')
      .end((error, response) => {
        response.should.have.status(200);
        response.body.events.should.be.a('array');
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
      .get('/v1.0/events?limit=' + query.limit + '&offset=' + query.offset)
      .end((error, response) => {
        response.should.have.status(400);
        response.body.should.be.a('object');
        response.body.should.have.property('code').eql(400);
        response.body.should.have.property('message').eql('Bad Request');
        response.body.should.have.property('detail').eql('You must pass-in valid skip and limit parameters');
        done();
      });
    });

    it('#it should GET an event by the given id', done => {
      let id = 189334338149285;
      chai.request(url)
      .get('/v1.0/events/'.concat(id))
      .end((error, response) => {
        response.should.have.status(200);
        response.body.should.be.a('object');
        response.body.should.have.property('eventId');
        response.body.should.have.property('eventPicture');
        response.body.should.have.property('eventName');
        response.body.should.have.property('eventDescription');
        response.body.should.have.property('eventStartTime');
        response.body.should.have.property('eventEndTime');
        response.body.should.have.property('eventLocation');

        done();
      });
    });

    it('#it should return an error for not existing event id', done => {
      let id = 11111111111111111;
      chai.request(url)
      .get('/v1.0/events/'.concat(id))
      .end((error, response) => {
        response.should.have.status(404);
        response.body.should.be.a('object');
        response.body.should.have.property('code').eql(404);
        response.body.should.have.property('message').eql('Not Found');
        done();
      });
    });

    it('#it should return an error for not number parameter of event id', done => {
      let id = 'qwerty';
      chai.request(url)
      .get('/v1.0/events/'.concat(id))
      .end((error, response) => {
        response.should.have.status(400);
        response.body.should.be.a('object');
        response.body.should.have.property('code').eql(400);
        response.body.should.have.property('message').eql('Bad Request');
        done();
      });
    });
  });

  describe('Events-location', () => {
    it('#it should GET events by Kyiv location coordinates', done => {
      let location = {};
      location.lat = '50.43';
      location.lng = '30.52';
      location.distance = '4000';
      let params = "lat=" + location.lat + "&lng=" + location.lng + "&distance=" + location.distance;

      chai.request(url)
      .get('/v1.0/events-location?'.concat(params))
      .end((error, response) => {
        response.should.have.status(200);
        response.body.events.should.be.a('array');
        expect(response.body.events.length).to.be.above(50);
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
      .get('/v1.0/events-location?'.concat(params))
      .end((error, response) => {
        response.should.have.status(400);
        response.body.should.be.a('object');
        response.body.should.have.property('message').eql('Bad Request');
        done();
      });
    });
  });
});
