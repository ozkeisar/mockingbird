import { Direction } from './Types/Direction';
import { handleArrayType } from './handleArrayType';
import { handleObjectType } from './handleObjectType';
import { handleScalarType } from './handleScalarType';
import { hasArrayType } from './hasArrayType';
import { hasObjectType } from './hasObjectType';
import { TranslatableTypeJsonSchema } from './Types/TranslateableTypeJsonSchema';

const parseType = function ({ path, schema, direction }: {
  path: string[];
  schema: TranslatableTypeJsonSchema;
  direction: Direction;
}): { typeName: string; typeDefinitions: string[] } {
  const graphqlTypeNames: string[] = [];
  const graphqlTypeDefinitions: string[] = [];

  const subPath = [ ...path, `_` ];

  if (hasArrayType(schema)) {
    return handleArrayType({ path: subPath, schema, direction });
  }
  if (hasObjectType(schema)) {
    return handleObjectType({ path: subPath, schema, direction });
  }

  if (!Array.isArray(schema.type)) {
    return handleScalarType({ type: schema.type });
  }

  schema.type.forEach((type): void => {
    const result = handleScalarType({ type });

    graphqlTypeNames.push(result.typeName);
    graphqlTypeDefinitions.push(...result.typeDefinitions);
  });

  const graphqlTypeName = graphqlTypeNames.
    filter((name): boolean => name.trim() !== '').
    join(' | ');

  return {
    typeName: graphqlTypeName,
    typeDefinitions: graphqlTypeDefinitions
  };
};

export { parseType };
