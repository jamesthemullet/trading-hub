/**
 * @jest-environment node
 */

import { handleError } from './error';

describe('handleError SSR (no window)', () => {
  it('returns the error message without accessing browser globals', () => {
    expect(
      handleError({
        error: { status: 'status', message: 'message' },
      })
    ).toBe('Error message status');
  });
});
