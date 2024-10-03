import { logger } from './logger';

describe('Logger', () => {
  it('should have necessary methods', () => {
    expect(logger).toHaveProperty('info');
    expect(logger).toHaveProperty('warn');
    expect(logger).toHaveProperty('error');
    expect(logger).toHaveProperty('debug');
  });
});
