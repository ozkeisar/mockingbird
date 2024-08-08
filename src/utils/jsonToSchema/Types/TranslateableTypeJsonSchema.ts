import { TranslatableArrayTypeJsonSchema } from './TranslatableArrayTypeJsonSchema';
import { TranslatableObjectTypeJsonSchema } from './TranslatableObjectTypeJsonSchema';
import { TranslatableScalarTypeJsonSchema } from './TranslatableScalarTypeJsonSchema';

type TranslatableTypeJsonSchema =
  TranslatableScalarTypeJsonSchema |
  TranslatableArrayTypeJsonSchema |
  TranslatableObjectTypeJsonSchema;

export type { TranslatableTypeJsonSchema };
