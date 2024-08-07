import { CommonJsonSchema } from './CommonJsonSchema';
import { TranslatableJsonSchema } from './TranslatableJsonSchema';

type TranslatableArrayTypeJsonSchema = {
  type: 'array';
  items: TranslatableJsonSchema;
} & CommonJsonSchema;

export { TranslatableArrayTypeJsonSchema };
