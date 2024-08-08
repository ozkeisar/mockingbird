import { Direction } from './Types/Direction';
import { parseSchema } from './parseSchema';
import { toBreadcrumb } from './toBreadcrumb';
import { toPascalCase } from './toPascalCase';
import { TranslatableObjectTypeJsonSchema } from './Types/TranslatableObjectTypeJsonSchema';
import * as errors from './errors';

const handleObjectType = function ({ path, schema, direction }: {
  path: string[];
  schema: TranslatableObjectTypeJsonSchema;
  direction: Direction;
}): { typeName: string; typeDefinitions: string[] } {
  const graphqlTypeName = toPascalCase(path);
  const graphqlTypeDefinitions: string[] = [];

  const lines = [];

  if (!('properties' in schema)) {
    throw new errors.SchemaInvalid(`Expected schema of type 'object' at '${toBreadcrumb(path)}' to contain properties.`);
  }

  for (const [ propertyName, propertySchema ] of Object.entries(schema.properties)) {
    const isRequired = (
      schema.required && schema.required.includes(propertyName)
    ) ?? false;

    const {
      typeName: propertyGraphqlTypeName,
      typeDefinitions: propertyGraphqlTypeDefinitions
    } = parseSchema({
      path: [ ...path, propertyName ],
      schema: propertySchema,
      direction
    });

    let line = `  ${propertyName}: ${propertyGraphqlTypeName}`;

    line += isRequired ? '!\n' : '\n';

    lines.push(line);
    graphqlTypeDefinitions.push(...propertyGraphqlTypeDefinitions);
  }

  let currentGraphqlTypeDefinition = '';

  currentGraphqlTypeDefinition += direction === 'input' ? 'input' : 'type';

  if (lines.length > 0) {
    currentGraphqlTypeDefinition += ` ${graphqlTypeName} {\n`;

    for (const line of lines) {
      currentGraphqlTypeDefinition += line;
    }

    currentGraphqlTypeDefinition += '}';
  } else {
    currentGraphqlTypeDefinition += ` ${graphqlTypeName}`;
  }

  graphqlTypeDefinitions.push(currentGraphqlTypeDefinition);

  return {
    typeName: graphqlTypeName,
    typeDefinitions: graphqlTypeDefinitions
  };
};

export { handleObjectType };
