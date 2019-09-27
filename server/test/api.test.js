const request = require('supertest');

const app = require('../src/app');

describe('GET /api/v1', () => {
  it('responds with a json message', function(done) {
    request(app)
      .get('/api/v1')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, {
        message: 'API - 👋🌎🌍🌏' 
      }, done);
  });
});

describe('POST /api/v1/messages', () => {
  it('responds with inserted message', function(done) {
    const requestObj = {
      produce: 'cherry',
      message: 'message',
      latitude: -90,
      longitude: 180
    };

    const responseObj = {
      ...requestObj,
      _id: '5d8b98e3272032aeb2ab176b',
      date: '2019-09-25T16:42:11.259Z'
    }
    request(app)
      .post('/api/v1/messages')
      .send(requestObj)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(res => {
        res.body._id = '5d8b98e3272032aeb2ab176b';
        res.body.date = '2019-09-25T16:42:11.259Z';
      })
      .expect(200, responseObj, done);
  });
});
