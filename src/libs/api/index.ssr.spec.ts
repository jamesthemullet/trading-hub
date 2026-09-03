/**
 * @jest-environment node
 *
 * Tests for the API client in an SSR (Node.js) environment where `window`
 * is not defined. Kept separate so the main spec can use jsdom.
 */

import { api } from './index';

describe('api SSR (no window)', () => {
  it('has no window global in this environment', () => {
    expect(typeof window).toBe('undefined');
  });

  it('does not throw building the client without a custom fetch', () => {
    expect(() => api()).not.toThrow();
  });
});
