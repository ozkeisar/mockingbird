import { v4 as uuid } from 'uuid';

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

export const formatFileName = (input: string): string => {
  // Remove special characters not allowed in file names
  // eslint-disable-next-line no-useless-escape
  const sanitizedFileName = input.replace(/[\/\\?%*:|"<>]/g, '');

  // Replace spaces with underscores
  const fileNameWithoutSpaces = sanitizedFileName.replace(/\s+/g, '_');

  // Truncate file name if it exceeds the maximum allowed length
  const maxLength = 255; // Windows limit for file name length
  const truncatedFileName = fileNameWithoutSpaces.slice(0, maxLength);

  return truncatedFileName;
};

export function formatToValidFilename(input: string): string {
  // List of invalid characters for Windows filenames
  // eslint-disable-next-line no-control-regex
  const invalidWindowsChars = /[<>:"/\\|?*\x00-\x1F]/g;
  // macOS only disallows the ":" character
  const invalidMacChars = /[:]/g;

  // Replace invalid characters with underscores, except for the first and last characters
  let sanitized = input
    .replace(invalidWindowsChars, '_')
    .replace(invalidMacChars, '_');

  // Remove any invalid characters if they are at the beginning or end
  sanitized = sanitized.replace(/^[_]+|[_]+$/g, '');

  // Trim whitespace from the start and end
  sanitized = sanitized.trim();

  // Ensure filename is not empty
  if (sanitized === '' || sanitized === '.' || sanitized === '..') {
    sanitized = 'untitled';
  }

  // Add a unique identifier (UUID) to the end of the filename
  const uniqueSuffix = uuid().split('-')[0]; // Use only the first part of the UUID for brevity
  sanitized = `${sanitized}_${uniqueSuffix}`;

  // Limit the filename length to 255 characters minus the length of the unique suffix and underscore
  if (sanitized.length > 255) {
    sanitized = `${sanitized.substring(
      0,
      255 - uniqueSuffix.length - 1,
    )}_${uniqueSuffix}`;
  }

  return sanitized;
}

export const buildUrl = (baseUrl: string, path: string) => {
  // Ensure baseUrl is defined and is a string
  if (!baseUrl || typeof baseUrl !== 'string') {
    throw new Error('Base URL must be a non-empty string');
  }

  // If path is undefined or empty, just return the base URL
  if (!path) {
    return baseUrl;
  }

  // Normalize the base URL by ensuring it ends with a single slash
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;

  // Normalize the path by removing leading slash if present
  const normalizedPath = path.startsWith('/') ? path.substring(1) : path;

  // Join the normalized base and path
  return normalizedBase + normalizedPath;
};
