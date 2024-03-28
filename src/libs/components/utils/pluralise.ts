export const pluralise = (word: string, count: number) =>
  `${word}${count > 1 ? 's' : ''}`;
