import { registerOTel } from '@vercel/otel';

import { register } from './instrumentation.page';

jest.mock('@vercel/otel', () => ({
  registerOTel: jest.fn(),
}));

describe('register', () => {
  it('should call registerOTel with the correct serviceName', () => {
    register();

    expect(registerOTel).toHaveBeenCalledTimes(1);
    expect(registerOTel).toHaveBeenCalledWith({ serviceName: 'trading-hub' });
  });
});
