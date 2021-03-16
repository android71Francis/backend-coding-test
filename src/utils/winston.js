const { format, transports, createLogger } = require('winston');

const options = {
  info: {
    level: 'info',
    filename: `${__dirname}/../../logs/info.log`,
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false,
  },
  debug: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
  },
};

const logger = createLogger({
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.File(options.info),
    new transports.Console(options.debug),
  ],
  exitOnError: false,
});

module.exports = logger;
