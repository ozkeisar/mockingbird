import { TranslatableArrayTypeJsonSchema } from './Types/TranslatableArrayTypeJsonSchema';
import { TranslatableTypeJsonSchema } from './Types/TranslateableTypeJsonSchema';

const hasArrayType = function (schema: TranslatableTypeJsonSchema): schema is TranslatableArrayTypeJsonSchema {
  return schema.type === 'array';
};

export { hasArrayType };
