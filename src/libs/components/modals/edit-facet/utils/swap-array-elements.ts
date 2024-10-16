export const toArrayWithSwappedElements = <T>(
  array: T[],
  indexA: number,
  indexB: number
): T[] => {
  if (
    indexA < 0 ||
    indexB < 0 ||
    indexA >= array.length ||
    indexB >= array.length
  ) {
    return array;
  }
  const results = array.slice();
  const firstItem = array[indexA];
  // eslint-disable-next-line functional/immutable-data
  results[indexA] = array[indexB];
  // eslint-disable-next-line functional/immutable-data
  results[indexB] = firstItem;

  return results;
};
