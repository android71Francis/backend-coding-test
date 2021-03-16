

const request = require('supertest');

const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(':memory:');

const app = require('../src/app')(db);
const buildSchemas = require('../src/schemas');

const sinon = require('sinon');

describe('API tests', () => {
  before((done) => {
    db.serialize((err) => {
      if (err) {
        return done(err);
      }
      buildSchemas(db);
      done();
    });
  });

  describe('GET /health', () => {
    it('should return health', (done) => {
      request(app)
        .get('/health')
        .expect('Content-Type', /text/)
        .expect(200, done);
    });
  });

  describe('Rides Services', () => {
    const mockRide = {
      start_lat: '35.929673',
      start_long: '-78.948237',
      end_lat: '36.929673',
      end_long: '-72.948237',
      rider_name: 'Rider Cruz',
      driver_name: 'Driver Cruz',
      driver_vehicle: 'Honda Cruz',
    };

    const mockRideInvLatLot = {
        ...mockRide,
        start_lat: '-91',
        start_long: '190'
    }

    const mockRideInvEndLatLot = {
        ...mockRide,
        end_lat: '-91',
        end_long: '190'
    }

    const mockRideNoName = {
        ...mockRide,
        rider_name: '',
        driver_name: '',
        driver_vehicle: '',
    }

    it('should throw error 500 if there is something wrong with with get ride list', async () => {
      const dbAllStub = sinon
        .stub(db, 'all')
        .yields(new Error('some fake error'))
      await request(app).get('/rides').expect(500)
      dbAllStub.restore()
    })

    it('should throw error 500 if there is something wrong with get ride by Id', async () => {
      const dbAllStub = sinon
        .stub(db, 'all')
        .yields(new Error('some fake error'))
      await request(app).get('/rides/1').expect(500)
      dbAllStub.restore()
    })

    it('should not able to add a Ride if start lat and lot no meet the condition', (done) => {
      request(app)
        .post('/rides')
        .send(mockRideInvLatLot)
        .expect('Content-Type', /json/)
        .expect(400, done);
    });


    it('should not able to add a Ride if end lat and lot no meet the condition', (done) => {
        request(app)
            .post('/rides')
            .send(mockRideInvEndLatLot)
            .expect('Content-Type', /json/)
            .expect(400, done);
    });

    it('should not able to add a Ride if name or driver name or is missing', (done) => {
        request(app)
            .post('/rides')
            .send(mockRideNoName)
            .expect('Content-Type', /json/)
            .expect(400, done);
    });

    it('should return rides not found ', (done) => {
        request(app)
            .get('/rides')
            .expect('Content-Type', /json/)
            .expect(404, done);
    });

    it('should return ride not found ', (done) => {
        request(app)
            .get('/rides/1')
            .expect('Content-Type', /json/)
            .expect(404, done);
    });

    it('should able to add a Ride ', (done) => {
      request(app)
        .post('/rides')
        .send(mockRide)
        .expect('Content-Type', /json/)
        .expect(200, done);
    });

    it('should return the Riders', (done) => {
      request(app)
        .get('/rides?page=1&size=5')
        .expect('Content-Type', /json/)
        .expect(200, done);
    });

    it('should return ride by id', (done) => {
        request(app)
            .get('/rides/1')
            .expect('Content-Type', /json/)
            .expect(200, done);
    });

    it('should throw error 500 if there is something wrong with add ride', async () => {
      const dbAllStub = sinon
        .stub(db, 'all')
        .yields(new Error('some fake error'))
      await request(app)
        .post('/rides')
        .send(mockRide)
        .expect(500)
      dbAllStub.restore()
    })
    
  });
});
