const health = require('./api/health');
const rides = require('./api/rides');

module.exports = db => [health, rides(db)];

