const { Create, GetAll, GetById } = require('../services/rides');


const errorHandling = (err, res) => {
  if (err.status) {
    res.status(err.status);
    res.send(err.errors[0]);
  } else {
    res.status(500);
    res.send('SERVER_ERROR');
  }
};

exports.create = async (req, res, db) => {
  try {
    const data = await Create(req.body, db);
    res.status(200).send(data);
  } catch (err) {
    errorHandling(err, res);
  }
};

exports.getAll = async (req, res, db) => {
  try {
    const data = await GetAll(req.query, db);
    res.status(200).send(data);
  } catch (err) {
    errorHandling(err, res);
  }
};

exports.getById = async (req, res, db) => {
  try {
    const data = await GetById(req.params.id, db);
    res.status(200).send(data);
  } catch (err) {
    errorHandling(err, res);
  }
};
