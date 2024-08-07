import { scalarTypes } from './scalarTypes';
import { TranslatableScalarTypeJsonSchema } from './Types/TranslatableScalarTypeJsonSchema';
import { TranslatableTypeJsonSchema } from './Types/TranslateableTypeJsonSchema';

const hasScalarType = function (
  schema: TranslatableTypeJsonSchema
): schema is TranslatableScalarTypeJsonSchema {
  if (Array.isArray(schema.type)) {
    return true;
  }

  return schema.type in scalarTypes;
};

export { hasScalarType };
