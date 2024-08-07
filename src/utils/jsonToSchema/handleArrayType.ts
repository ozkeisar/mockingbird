import { Direction } from './Types/Direction';
import { parseSchema } from './parseSchema';
import { TranslatableArrayTypeJsonSchema } from './Types/TranslatableArrayTypeJsonSchema';

const handleArrayType = function ({ path, schema, direction }: {
  path: string[];
  schema: TranslatableArrayTypeJsonSchema;
  direction: Direction;
}): { typeName: string; typeDefinitions: string[] } {
  const {
    typeName: graphqlTypeName,
    typeDefinitions: graphqlTypeDefinitions
  } = parseSchema({ path, schema: schema.items, direction });

  return {
    typeName: `[${graphqlTypeName}]`,
    typeDefinitions: graphqlTypeDefinitions
  };
};

export { handleArrayType };
