const ErrorThrow = require('../../utils/ErrorThrow');
const logger = require('../../utils/winston');

// Add Ride by Values
exports.addRide = (db, values) => new Promise((resolve, reject) => {
  const sqlQuery = 'INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.run(sqlQuery, values, function (err) {
    if (err) {
      logger.warn('Error on add ride sql', err.message);
      reject(new ErrorThrow({
        status: 500,
        errors: [{
          error_code: 'SERVER_ERROR',
          message: 'Unknown error',
        }],
      }));
    }
    logger.info(`Successfully add ride with id ${this.lastID}`);
    resolve(this.lastID);
  });
});

// Get Ride by Id
exports.getRideById = (db, id) => new Promise((resolve, reject) => {
  const sqlQuery = 'SELECT * FROM Rides WHERE rideID = ?';
  db.all(sqlQuery, id, (err, rows) => {
    if (err) {
      logger.warn(`Error on get ride sql by id ${id}`, err.message);
      reject(new ErrorThrow({
        status: 500,
        errors: [{
          error_code: 'SERVER_ERROR',
          message: 'Unknown error',
        }],
      }));
    }
    resolve(rows);
  });
});


// Get All with Pagination
exports.getAll = (db, values) => new Promise((resolve, reject) => {
  const sqlQuery = 'SELECT *, count(*) OVER() AS totalRides FROM Rides LIMIT ? OFFSET ?';

  db.all(sqlQuery, values, (err, rows) => {
    if (err) {
      logger.warn('Error on get all ride', err.message);
      reject(new ErrorThrow({
        status: 500,
        errors: [{
          error_code: 'SERVER_ERROR',
          message: 'Unknown error',
        }],
      }));
    }
    resolve(rows);
  });
});
