/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable global-require */

const express = require('express');

const app = express();
const port = 8010;

const bodyParser = require('body-parser');

const jsonParser = bodyParser.json();
const logger = require('./src/utils/winston');

const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(':memory:');

const buildSchemas = require('./src/schemas');

db.serialize(() => {
  buildSchemas(db);

  const app = require('./src/app')(db);

  app.listen(port, () => logger.info({
    message: 'Application started',
    port,
    host: 'localhost',
    env: process.env.NODE_ENV || 'development',
  }));
});
