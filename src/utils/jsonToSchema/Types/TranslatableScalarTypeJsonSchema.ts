import { CommonJsonSchema } from './CommonJsonSchema';
import { ScalarType } from './ScalarType';

type TranslatableScalarTypeJsonSchema = {
  type: ScalarType | ScalarType[];
} & CommonJsonSchema;

export type { TranslatableScalarTypeJsonSchema };
