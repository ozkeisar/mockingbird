import { TranslatableTypeJsonSchema } from './TranslateableTypeJsonSchema';
import { TranslatableUnionJsonSchema } from './TranslatableUnionJsonSchema';

type TranslatableJsonSchema = TranslatableTypeJsonSchema | TranslatableUnionJsonSchema;

export { TranslatableJsonSchema };
