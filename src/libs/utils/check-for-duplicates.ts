export const checkForDuplicates = (
  list: string[],
  itemBeingAdded: string,
  type: 'keyword' | 'ruleset'
): string => {
  if (list.includes(itemBeingAdded)) {
    return `${type.charAt(0).toUpperCase() + type.slice(1)} ${itemBeingAdded} has already been added`;
  }

  return '';
};
