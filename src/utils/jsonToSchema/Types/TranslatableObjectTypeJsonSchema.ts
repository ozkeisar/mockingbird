import { CommonJsonSchema } from './CommonJsonSchema';
import { TranslatableJsonSchema } from './TranslatableJsonSchema';

type TranslatableObjectTypeJsonSchema = {
  type: 'object';
  properties: Record<string, TranslatableJsonSchema>;
  required?: string[];
  additionalProperties: false;
} & CommonJsonSchema;

export type { TranslatableObjectTypeJsonSchema };
