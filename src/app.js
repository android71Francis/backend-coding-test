/* eslint-disable consistent-return */
/* eslint-disable func-names */


const express = require('express');

const app = express();

const bodyParser = require('body-parser');

const jsonParser = bodyParser.json();

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

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

module.exports = (db) => {
  app.get('/health', (req, res) => res.send('Healthy'));

  app.post('/rides', jsonParser, (req, res) => {
    const startLatitude = Number(req.body.start_lat);
    const startLongitude = Number(req.body.start_long);
    const endLatitude = Number(req.body.end_lat);
    const endLongitude = Number(req.body.end_long);
    const riderName = req.body.rider_name;
    const driverName = req.body.driver_name;
    const driverVehicle = req.body.driver_vehicle;

    if (startLatitude < -90 || startLatitude > 90
      || startLongitude < -180 || startLongitude > 180) {
      return res.status(400).send({
        error_code: 'VALIDATION_ERROR',
        message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
      });
    }

    if (endLatitude < -90 || endLatitude > 90 || endLongitude < -180 || endLongitude > 180) {
      return res.status(400).send({
        error_code: 'VALIDATION_ERROR',
        message: 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
      });
    }

    if (typeof riderName !== 'string' || riderName.length < 1 ||
            typeof driverName !== 'string' || driverName.length < 1 ||
            typeof driverVehicle !== 'string' || driverVehicle.length < 1) {
      return res.status(400).send({
        error_code: 'VALIDATION_ERROR',
        message: 'Rider name must be a non empty string',
      });
    }

    const values = [req.body.start_lat, req.body.start_long, req.body.end_lat,
      req.body.end_long, req.body.rider_name, req.body.driver_name, req.body.driver_vehicle];

    db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values, function (err) {
      if (err) {
        return res.status(500).send({
          error_code: 'SERVER_ERROR',
          message: 'Unknown error',
        });
      }

      db.all('SELECT * FROM Rides WHERE rideID = ?', this.lastID, (errDb, rows) => {
        if (errDb) {
          return res.status(500).send({
            error_code: 'SERVER_ERROR',
            message: 'Unknown error',
          });
        }

        res.send(rows);
      });
    });
  });

  app.get('/rides', (req, res) => {
    const { page = 1, size = 5 } = req.query;
    const { limit, offset } = getPagination(page, size);

    db.all('SELECT *, count(*) OVER() AS totalRides FROM Rides LIMIT ? OFFSET ?', [limit, offset], (err, rows) => {
      if (err) {
        return res.status(500).send({
          error_code: 'SERVER_ERROR',
          message: 'Unknown error',
        });
      }

      if (rows.length === 0) {
        return res.status(404).send({
          error_code: 'RIDES_NOT_FOUND_ERROR',
          message: 'Could not find any rides',
        });
      }

      res.send(getPagingData(rows, page, limit));
    });
  });

  app.get('/rides/:id', (req, res) => {
    db.all(`SELECT * FROM Rides WHERE rideID='${req.params.id}'`, (err, rows) => {
      if (err) {
        return res.status(500).send({
          error_code: 'SERVER_ERROR',
          message: 'Unknown error',
        });
      }

      if (rows.length === 0) {
        return res.status(404).send({
          error_code: 'RIDES_NOT_FOUND_ERROR',
          message: 'Could not find any rides',
        });
      }

      res.send(rows);
    });
  });


  // API documentations
  if (['development'].includes(process.env.NODE_ENV || 'development')) {
    const swaggerDocument = YAML.load(`${__dirname}/docs/api.yaml`);

    app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument),
    );
  }

  return app;
};
