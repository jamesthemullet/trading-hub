import { assertNever } from './assert-never';

describe('assertNever', () => {
  it('should returns the input value', () => {
    expect(assertNever(1 as never)).toBe(1);
  });
});
