import { getPaginationOffset } from './pagination';

describe('getPaginationOffset', () => {
  it('returns 0 for the first page', () => {
    expect(getPaginationOffset(1, 20)).toBe(0);
  });

  it('returns the correct offset for a later page', () => {
    expect(getPaginationOffset(3, 20)).toBe(40);
  });

  it('scales with a different page size', () => {
    expect(getPaginationOffset(2, 50)).toBe(50);
  });
});
