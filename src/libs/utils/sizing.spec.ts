import { sizing } from './sizing';

describe('spacing', () => {
  it('should return rem value based on the unit 8px', () => {
    expect(sizing('20%')).toBe('20%');
    expect(sizing(1)).toBe('0.5rem');
    expect(sizing(2)).toBe('1rem');
    expect(sizing(3)).toBe('1.5rem');
    expect(sizing(44)).toBe('22rem');
    expect(sizing(0)).toBe('0rem');
    expect(sizing('-100%')).toBe('-100%');
  });
});
