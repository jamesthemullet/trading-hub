import { spacing } from './spacing';

describe('spacing', () => {
  it('should return rem value based on the unit 8px', () => {
    expect(spacing(1)).toBe('0.5rem');
    expect(spacing(2)).toBe('1rem');
    expect(spacing(3)).toBe('1.5rem');
    expect(spacing(4)).toBe('2rem');
    expect(spacing('-50%')).toBe('-50%');
  });
});
