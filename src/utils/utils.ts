export function removeParameters(input: string | null): string | null {
  if (!input) {
    return input;
  }
  // eslint-disable-next-line no-useless-escape
  return input.replace(/\([^\)]*\)/g, '');
}

export function mergeObjectsRecursive(
  target: Record<string, any>,
  source: Record<string, any>,
) {
  // eslint-disable-next-line no-restricted-syntax
  for (const key in source) {
    // eslint-disable-next-line no-prototype-builtins
    if (source.hasOwnProperty(key)) {
      if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
        target[key] = target[key] || {};
        mergeObjectsRecursive(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }
}

export function mergeObjects(
  objects: Record<string, any>[],
): Record<string, any> {
  const result: Record<string, any> = {};

  // eslint-disable-next-line no-restricted-syntax
  for (const obj of objects) {
    mergeObjectsRecursive(result, obj);
  }

  return result;
}
