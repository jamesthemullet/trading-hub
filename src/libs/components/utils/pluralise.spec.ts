import { pluralise } from './pluralise';

describe('pluralise', () => {
  it('should return with out plural', () => {
    expect(pluralise('word', 1)).toBe('word');
  });

  it('should return with plural', () => {
    expect(pluralise('word', 3)).toBe('words');
  });
});
