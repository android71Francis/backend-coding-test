const { expect } = require('chai');

const utilsLogger = require('../../src/utils/winston');

describe('Winston logger', () => {
  it('Default logger', () => {
    expect(utilsLogger).to.be.an('Object');
  });

  it('Shoule return message object when loggin info', () => {
    expect(utilsLogger.info('test logger')).to.be.an('Object');
  });

  it('Shoule return message object when loggin debug', () => {
    expect(utilsLogger.debug('test logger')).to.be.an('Object');
  });
});
