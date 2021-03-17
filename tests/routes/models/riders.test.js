const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(':memory:');
const buildSchemas = require('../../../src/schemas');

const rideService = require('../../../src/routes/models/rides');
const sinon = require('sinon');
const { expect } = require('chai');

describe('Ride Models Tests', () => {
  const MockRide = {
    rideID: 1,
    startLat: 35.929673,
    startLong: -78.948237,
    endLat: 36.929673,
    endLong: -72.948237,
    riderName: 'Rider Cruz',
    driverName: 'Driver Cruz',
    driverVehicle: 'Honda Cruz',
    created: '2021-03-16 16:05:55',
  };

  const MockRides = [MockRide];

  let stubAddRide;
  let stubDBRun;
  let stubGetAll;
  let stubGetRideById;

  before((done) => {
    db.serialize((err) => {
      if (err) {
        return done(err);
      }
      buildSchemas(db);
      stubAddRide = sinon.stub(rideService, 'addRide');
      stubDBRun = sinon.stub(db, 'run');
      stubGetAll = sinon.stub(rideService, 'getAll');
      stubGetRideById = sinon.stub(rideService, 'getRideById');
      done();
    });
  });

  after(() => {
    stubAddRide.restore();
    stubDBRun.restore();
    stubGetAll.restore();
    stubGetRideById.restore();
  });

  it('should able to add rides in db and return last id', (done) => {
    stubAddRide.resolves(MockRide.rideID);
    rideService.addRide(db, []).then((result) => {
      expect(MockRide.rideID).to.be.equal(result);
      done();
    });
  });

  it('should able to add rides in db', (done) => {
    stubDBRun.yields().resolves(1);
    db.run('', [], () => {}).then((result) => {
      expect(1).to.be.equal(result);
      done();
    });
  });

  it('should not able to add rides in db', (done) => {
    stubDBRun.yields().rejects(new Error('ERR'));
    db.run('', [], () => {}).then().catch((err) => {
      if (err) done();
    });
  });

  it('should not able to add rides in db if return error', (done) => {
    stubAddRide.rejects(new Error('ERROR'));
    rideService.addRide(db, MockRide).then().catch(() => {
      done();
    });
  });

  it('should able to get rides list in db', (done) => {
    stubGetAll.resolves(MockRides);
    rideService.getAll(db, [5, 0]).then((result) => {
      expect(MockRides).to.be.equal(result);
      done();
    });
  });

  it('should able to get rows in db', (done) => {
    stubDBRun.yields().resolves(MockRides);
    db.run('', [], () => {}).then((result) => {
      expect(MockRides).to.be.equal(result);
      done();
    });
  });

  it('should not able to get rides list in db if return error', (done) => {
    stubGetAll.rejects(new Error('ERROR'));
    rideService.getAll(db, MockRide).then().catch(() => {
      done();
    });
  });


  it('should able to get rides by id in db', (done) => {
    stubGetRideById.resolves(MockRides);
    rideService.getRideById(db, 1).then((result) => {
      expect(MockRides).to.be.equal(result);
      done();
    });
  });

  it('should able to get rides empty [] if id not found', (done) => {
    stubGetRideById.resolves([]);
    rideService.getRideById(db, 2).then((result) => {
      expect(result.length).to.be.equal(0);
      done();
    });
  });

  it('should able to get rides empty [] if id not found', (done) => {
    stubGetRideById.rejects(new Error('ERROR'));
    rideService.getRideById(db, 2).then().catch(() => {
      done();
    });
  });
});
