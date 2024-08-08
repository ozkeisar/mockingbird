import { TranslatableObjectTypeJsonSchema } from './Types/TranslatableObjectTypeJsonSchema';
import { TranslatableTypeJsonSchema } from './Types/TranslateableTypeJsonSchema';

const hasObjectType = function (schema: TranslatableTypeJsonSchema): schema is TranslatableObjectTypeJsonSchema {
  return schema.type === 'object';
};

export { hasObjectType };
