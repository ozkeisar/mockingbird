import { TranslatableTypeJsonSchema } from './TranslateableTypeJsonSchema';

type TranslatableUnionJsonSchema =
  {
    oneOf: TranslatableTypeJsonSchema[];
  } | {
    anyOf: TranslatableTypeJsonSchema[];
  };

export type { TranslatableUnionJsonSchema };
