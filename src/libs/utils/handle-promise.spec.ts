import { handlePromise } from './handle-promise';

describe('handlePromise', () => {
  it('should return a promise that resolves with the data if the promise resolves', async () => {
    const [err, data] = await handlePromise(Promise.resolve('data'));
    expect(err).toBeNull();
    expect(data).toBe('data');
  });

  it('should return a promise that resolves with an error if the promise rejects', async () => {
    const [err, data] = await handlePromise(Promise.reject(new Error('error')));
    expect(err).toBeInstanceOf(Error);
    expect(err?.message).toBe('error');
    expect(data).toBeNull();
  });
});
