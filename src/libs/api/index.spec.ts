import { api } from './index';

describe('API', () => {
  it('should default to BFF proxy endpoint', () => {
    expect(api().baseUrl).toEqual('/api');
  });

  it('should use env var if present', () => {
    process.env['MERCHANDISING_PROXY_BASE_URL'] = 'http://localhost';
    expect(api().baseUrl).toEqual('http://localhost');
    delete process.env['MERCHANDISING_PROXY_BASE_URL'];
  });
});
