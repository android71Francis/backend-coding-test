/* eslint-disable consistent-return */
/* eslint-disable func-names */
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const bodyParser = require('body-parser');

const app = express();

const routes = require('./routes');

module.exports = (db) => {
  app.use(bodyParser.json({ limit: '10kb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '10kb' }));

  app.use(routes(db));

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
