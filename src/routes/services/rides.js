/* eslint-disable no-param-reassign */
const ErrorThrow = require('../../utils/ErrorThrow');
const { addRide, getRideById, getAll } = require('../models/rides');

exports.Create = async (body, db) => {
  try {
    const startLatitude = Number(body.start_lat);
    const startLongitude = Number(body.start_long);
    const endLatitude = Number(body.end_lat);
    const endLongitude = Number(body.end_long);
    const riderName = body.rider_name;
    const driverName = body.driver_name;
    const driverVehicle = body.driver_vehicle;

    if (startLatitude < -90 || startLatitude > 90
        || startLongitude < -180 || startLongitude > 180) {
      throw new ErrorThrow({
        status: 400,
        errors: [{
          error_code: 'VALIDATION_ERROR',
          message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
        }],
      });
    }

    if (endLatitude < -90 || endLatitude > 90 || endLongitude < -180 || endLongitude > 180) {
      throw new ErrorThrow({
        status: 400,
        errors: [{
          error_code: 'VALIDATION_ERROR',
          message: 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
        }],
      });
    }

    if (typeof riderName !== 'string' || riderName.length < 1 ||
              typeof driverName !== 'string' || driverName.length < 1 ||
              typeof driverVehicle !== 'string' || driverVehicle.length < 1) {
      throw new ErrorThrow({
        status: 400,
        errors: [{
          error_code: 'VALIDATION_ERROR',
          message: 'Rider name must be a non empty string',
        }],
      });
    }

    const values = [body.start_lat, body.start_long, body.end_lat,
      body.end_long, body.rider_name, body.driver_name, body.driver_vehicle];

    const lastId = await addRide(db, values).then(results => results);
    const result = await getRideById(db, lastId).then(results => results);

    return result;
  } catch (error) {
    throw error;
  }
};

function getPagination(page, size) {
  const limit = +size;
  const offset = (page - 1) * limit;

  return { limit, offset };
}

function getPagingData(data, page, size) {
  const { totalRides } = data[0];
  const currentPage = parseInt(page, 10) || 1;
  const totalPages = Math.ceil(totalRides / size);
  const rides = data.filter(obj => delete obj.totalRides);

  return {
    totalRides, rides, totalPages, currentPage,
  };
}

exports.GetAll = async (query, db) => {
  try {
    const { page = 1, size = 5 } = query;
    const { limit, offset } = getPagination(page, size);

    const rides = await getAll(db, [limit, offset]).then(results => results);

    if (rides.length === 0) {
      throw new ErrorThrow({
        status: 404,
        errors: [{
          error_code: 'RIDES_NOT_FOUND_ERROR',
          message: 'Could not find any rides',
        }],
      });
    }

    return getPagingData(rides, page, limit);
  } catch (error) {
    throw error;
  }
};

exports.GetById = async (id, db) => {
  try {
    const result = await getRideById(db, id).then(results => results);

    if (result.length === 0) {
      throw new ErrorThrow({
        status: 404,
        errors: [{
          error_code: 'RIDES_NOT_FOUND_ERROR',
          message: 'Could not find any rides',
        }],
      });
    }

    return result;
  } catch (error) {
    throw error;
  }
};

