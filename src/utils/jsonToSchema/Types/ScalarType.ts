// We choose to construct a union type from an array, basically imitating the enum feature, instead of a
// proper enum, because a proper enum would require you to write something like `scalarType.string` instead
// of being able to just write `string`. which is possible with a union type. Since we want normal json
// schemas to be compatible with this, this is the better choice.
const scalarTypeEnum = [ 'boolean', 'integer', 'number', 'string' ] as const;

type ScalarType = 'boolean' | 'integer' | 'number' | 'string';

export { scalarTypeEnum };
export type { ScalarType };
