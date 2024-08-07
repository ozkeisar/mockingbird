import { Direction } from './Types/Direction';
import { parseSchema } from './parseSchema';
import { TranslatableJsonSchema } from './Types/TranslatableJsonSchema';

const getGraphqlSchemaFromJsonSchema = function ({ rootName, schema, direction = 'output' }: {
  rootName: string;
  schema: TranslatableJsonSchema;
  direction?: Direction;
}): { typeName: string; typeDefinitions: string[] } {
  return parseSchema({ path: [ rootName ], schema, direction });
};

export { getGraphqlSchemaFromJsonSchema };
