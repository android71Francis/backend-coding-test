const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(':memory:');
const buildSchemas = require('../../../src/schemas');

const { Create, GetAll, GetById } = require('../../../src/routes/services/rides');
const rideModel = require('../../../src/routes/models/rides');
const sinon = require('sinon');
const { expect } = require('chai');

const ErrorThrow = require('../../../src/utils/winston');

describe('Ride Services Tests', () => {
  const MockRide = {
    rideID: 1,
    startLat: 35.929673,
    startLong: -78.948237,
    endLat: 36.929673,
    endLong: -72.948237,
    riderName: 'Rider Cruz',
    driverName: 'Driver Cruz',
    driverVehicle: 'Honda Cruz',
    created: '2021-03-16 20:13:43',
  };

  const MockRideBody = {
    start_lat: '35.929673',
    start_long: '-78.948237',
    end_lat: '36.929673',
    end_long: '-72.948237',
    rider_name: 'Rider Cruz',
    driver_name: 'Driver Cruz',
    driver_vehicle: 'Honda Cruz',
  };

  const MockRideBodyInvStart = {
    ...MockRideBody,
    start_lat: '-135.929673',
    start_long: '-178.948237',
  };

  const MockRideBodyInvEnd = {
    ...MockRideBody,
    end_lat: '-136.929673',
    end_long: '-172.948237',
  };

  const MockRideBodyNoName = {
    ...MockRideBody,
    rider_name: '',
    driver_name: '',
    driver_vehicle: '',
  };

  const MockRides = [MockRide];

  const MockRidesPage = {
    totalRides: 1,
    rides: MockRide,
    totalPages: 1,
    currentPage: 1,
  };

  let stubAddRide;
  let stubGetRideById;
  let stubGetAll;

  before((done) => {
    db.serialize((err) => {
      if (err) {
        return done(err);
      }
      buildSchemas(db);
      stubAddRide = sinon.stub(rideModel, 'addRide');
      stubGetRideById = sinon.stub(rideModel, 'getRideById');
      stubGetAll = sinon.stub(rideModel, 'getAll');
      done();
    });
  });

  after(() => {
    stubAddRide.restore();
    stubGetRideById.restore();
    stubGetAll.restore();
  });


  it('should able to add rides', async () => {
    stubAddRide.onCall().resolves(MockRide.rideID);
    stubGetRideById.onCall().resolves(MockRides);

    const data = await Create(MockRideBody, db);
    expect(MockRide.rideID).to.be.equal(data[0].rideID);
  });

  it('should not add rides if start latlot invalid.', async () => {
    try {
      await Create(MockRideBodyInvStart, db);
    } catch (error) {
      expect(400).to.be.equal(error.status);
      expect('VALIDATION_ERROR').to.be.equal(error.errors[0].error_code);
    }
  });

  it('should not add rides if end latlot is invalid.', async () => {
    try {
      await Create(MockRideBodyInvEnd, db);
    } catch (error) {
      expect(400).to.be.equal(error.status);
      expect('VALIDATION_ERROR').to.be.equal(error.errors[0].error_code);
    }
  });

  it('should not add rides if no name is invalid.', async () => {
    try {
      await Create(MockRideBodyNoName, db);
    } catch (error) {
      expect(400).to.be.equal(error.status);
      expect('VALIDATION_ERROR').to.be.equal(error.errors[0].error_code);
    }
  });

  it('should able to get rides list', async () => {
    stubGetAll.onCall().resolves(MockRides);

    const result = await GetAll({ page: 1, size: 5 }, db);
    expect(MockRides.rideID).to.be.equal(result.rides.rideID);
    expect(1).to.be.equal(result.currentPage);
    expect(1).to.be.equal(result.totalPages);
    expect(1).to.be.equal(result.totalRides);
  });

  it('should able to get rides detail by Id', async () => {
    stubGetRideById.onCall().resolves(MockRides);

    const result = await GetById(1, db);
    expect(MockRides.rideID).to.be.equal(result.rideID);
  });

});
