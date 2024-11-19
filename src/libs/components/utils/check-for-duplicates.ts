export const checkForDuplicates = (
  list: string[],
  itemBeingAdded: string,
  type: 'keyword' | 'ruleset'
): string => {
  const updatedList = [...list, itemBeingAdded];

  const hasDuplicates = updatedList.some(
    (item, index) => updatedList.indexOf(item) !== index
  );

  if (hasDuplicates) {
    return `${type.charAt(0).toUpperCase() + type.slice(1)} ${itemBeingAdded} has already been added`;
  }

  return '';
};
