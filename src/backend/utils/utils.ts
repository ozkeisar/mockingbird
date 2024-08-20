import { v4 as uuid } from 'uuid';

export function listToHashmap<T>(
  list: T[],
  keyExtractor: (item: T) => string,
): { [key: string]: T } {
  const hashmap: { [key: string]: T } = {};
  list.forEach((item) => {
    const key = keyExtractor(item);
    hashmap[key] = item;
  });
  return hashmap;
}

export function hashmapToList<T>(hashmap: { [key: string]: T }): T[] {
  return Object.keys(hashmap).map((key) => hashmap[key]);
}

export function generateUniqueIdentifier() {
  // You might want to further process or hash this identifier for privacy or security reasons
  return uuid();
}

export function replaceUndefined(obj: any) {
  // eslint-disable-next-line no-restricted-syntax
  for (const key in obj) {
    // eslint-disable-next-line no-prototype-builtins
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'undefined') {
        obj[key] = null;
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        replaceUndefined(obj[key]);
      }
    }
  }
  return obj;
}
