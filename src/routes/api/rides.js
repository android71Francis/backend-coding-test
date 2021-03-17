const router = require('express').Router();

const { create, getAll, getById } = require('../controllers/rides');

module.exports = (db) => {

  router.get('/rides', (req, res) => getAll(req, res, db));

  router.post('/rides', (req, res) => create(req, res, db));

  router.get('/rides/:id', (req, res) => getById(req, res, db));

  return router;
};
