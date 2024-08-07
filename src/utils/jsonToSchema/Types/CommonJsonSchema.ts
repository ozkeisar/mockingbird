// This file contains the types of the json-schema specification that we want to keep
// unmodified and unrestricted. The original type can be found here:
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/c6a5bf9836f8347746630289193c529480067c0b/types/json-schema/index.d.ts#L618

import { JSONSchema7, JSONSchema7Definition, JSONSchema7Type } from 'json-schema';
interface CommonJsonSchema {
  $id?: string;
  $schema?: string;
  $comment?: string;

  enum?: JSONSchema7Type[];
  const?: JSONSchema7Type;

  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: number;
  minimum?: number;
  exclusiveMinimum?: number;

  maxLength?: number;
  minLength?: number;
  pattern?: string;
  format?: string;

  additionalItems?: JSONSchema7Definition;
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  contains?: JSONSchema7;

  contentMediaType?: string;
  contentEncoding?: string;

  title?: string;
  description?: string;
  default?: JSONSchema7Type;
  readOnly?: boolean;
  writeOnly?: boolean;
  examples?: JSONSchema7Type;
}

export type { CommonJsonSchema };
