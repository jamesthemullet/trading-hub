import { toArrayWithSwappedElements } from './swap-array-elements';

describe('toArrayWithSwappedElements', () => {
  it('should swap elements in array', () => {
    const array = [1, 2, 3, 4, 5];
    const indexA = 0;
    const indexB = 4;
    const result = toArrayWithSwappedElements(array, indexA, indexB);

    expect(result).toEqual([5, 2, 3, 4, 1]);
  });

  it('should swap last element', () => {
    const array = [1, 2, 3, 4, 5];
    const result = toArrayWithSwappedElements(
      array,
      array.length - 1,
      array.length
    );

    expect(result).toEqual([1, 2, 3, 4, 5]);
  });

  it('should swap first element', () => {
    const array = [1, 2, 3, 4, 5];
    const result = toArrayWithSwappedElements(array, 0, -1);

    expect(result).toEqual([1, 2, 3, 4, 5]);
  });
});
