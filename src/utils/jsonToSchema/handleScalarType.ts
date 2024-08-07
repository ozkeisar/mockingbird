import { ScalarType } from './Types/ScalarType';
import { scalarTypes } from './scalarTypes';

const handleScalarType = function ({ type }: {
  type: ScalarType;
}): { typeName: string; typeDefinitions: string[] } {
  const graphqlTypeName = scalarTypes[type];
  const graphqlTypeDefinitions: string[] = [];

  return {
    typeName: graphqlTypeName,
    typeDefinitions: graphqlTypeDefinitions
  };
};

export { handleScalarType };
