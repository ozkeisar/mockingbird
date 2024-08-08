const toPascalCase = function (words: string[]): string {
  return words.
    map((word): string => `${word[0].toUpperCase()}${word.slice(1)}`).
    join('');
};

export { toPascalCase };
