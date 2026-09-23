/**
 * @jest-environment node
 */
import { track } from './analytics';

describe('analytics SSR', () => {
  it('does not track events when window is unavailable', () => {
    expect(() => track({ event: 'mock event' })).not.toThrow();
  });
});
