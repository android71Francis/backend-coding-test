/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable global-require */
const PORT = 8010;
const NODE_ENV = process.env.NODE_ENV || 'development';

const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(':memory:');

const buildSchemas = require('./src/schemas');
const logger = require('./src/utils/winston');

db.serialize(() => {
  buildSchemas(db);
  const app = require('./src/app')(db);
  app.listen(PORT, () => logger.info({ message: 'Application started', PORT, NODE_ENV }));
});
