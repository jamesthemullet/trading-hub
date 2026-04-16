/**
 * @jest-environment node
 *
 * Tests for dynatrace utilities in an SSR (Node.js) environment where
 * `window` is not defined. Kept separate so the main spec can use jsdom.
 */

import { reportErrorToDynatrace, setupGlobalErrorHandlers } from './dynatrace';

describe('dynatrace SSR (no window)', () => {
  it('reportErrorToDynatrace should not throw when window is undefined', () => {
    expect(() => reportErrorToDynatrace(new Error('Test'))).not.toThrow();
  });

  it('setupGlobalErrorHandlers should return early when window is undefined', () => {
    const result = setupGlobalErrorHandlers();
    expect(result).toBeUndefined();
  });
});
