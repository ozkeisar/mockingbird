import { PresetsFolder, RouteParent, ServerSettings } from '../types';

export const ExampleServerName = 'ExampleServer';
export const ExampleServerSettings: ServerSettings = {
  proxyBaseUrl: null,
  forceProxy: false,
  delay: 0,
  port: 3001,
  duplicateCookies: false,
  reWriteCookieDomain: false,
  simplifyCookies: false,
};

export const ExampleRestData: RouteParent = {
  id: 'c3d0aa64-28ca-48ea-87fe-80fd5ac028b7',
  filename: 'parent',
  type: 'Rest',
  name: null,
  schemaPath: 'test',
  graphqlQueriesType: 'Query',
  graphQlRouteHash: {},
  routesHash: {
    '6d4aa7ed-a23b-4b1e-a48b-83ca7ca5f1b9': {
      id: '6d4aa7ed-a23b-4b1e-a48b-83ca7ca5f1b9',
      description: 'example route for Mockingbird',
      routePath: '/getExample',
      method: 'get',
      activeResponseId: '9eaf95df-53e1-45b0-ad1a-01f134294811',
      responsesHash: {
        '4b616f18-218d-4c0d-9967-20404cda37e9': {
          id: '4b616f18-218d-4c0d-9967-20404cda37e9',
          name: 'Object response example',
          description: 'Return example of object response ',
          res: {
            data: {
              isObj: true,
            },
            headers: {},
            code: 200,
          },
          exec: null,
          url: null,
          type: 'obj',
          blockProxy: true,
        },
        '9eaf95df-53e1-45b0-ad1a-01f134294811': {
          id: '9eaf95df-53e1-45b0-ad1a-01f134294811',
          name: 'Func response example',
          description: 'Example of func that returns object response',
          exec: '(req, res) => {\n\t\n\tres.status(400).send({ isFunc: true })\n}',
          type: 'func',
          url: null,
          res: null,
          blockProxy: false,
        },
        'f9b2af90-4dbb-458b-905b-030adabc6396': {
          id: 'f9b2af90-4dbb-458b-905b-030adabc6396',
          name: 'Proxy response',
          description: 'Example of proxy response',
          url: 'https://www.jsonkeeper.com/b/ZIA2',
          type: 'proxy',
          res: null,
          exec: null,
          blockProxy: false,
        },
      },
      paramType: 'body',
      paramValue: '',
      paramKey: '',
      withParams: false,
    },
    '3a5dcb68-6e00-4c11-9edc-272081a71262': {
      description: 'Example of a post request',
      routePath: '/postExample',
      method: 'post',
      activeResponseId: '1a4d6a7f-e56a-40dd-8d4e-e398daa92484',
      responsesHash: {
        '1a4d6a7f-e56a-40dd-8d4e-e398daa92484': {
          id: '1a4d6a7f-e56a-40dd-8d4e-e398daa92484',
          name: 'Success',
          description: 'Example of a success response',
          res: {
            code: 200,
            headers: {},
            data: {
              success: 'true',
            },
          },
          exec: null,
          url: null,
          type: 'obj',
          blockProxy: false,
        },
      },
      withParams: false,
      paramKey: null,
      paramType: 'query',
      paramValue: null,
      id: '3a5dcb68-6e00-4c11-9edc-272081a71262',
    },
  },
  path: '/parent',
};

export const ExampleGraphqlParent: RouteParent = {
  id: '37d6038e-d706-43b8-a924-a61521e92702',
  filename: 'Graphql_parent',
  path: '/graphql',
  routesHash: {},
  graphQlRouteHash: {
    'c336c107-b649-49f0-beca-fc16458984ca': {
      id: 'c336c107-b649-49f0-beca-fc16458984ca',
      type: 'Query',
      name: 'simpleExample',
      description: '',
      activeResponseId: '3bdfaf3f-9244-46e3-9003-b3fd3c88227a',
      responsesHash: {
        'deaf860f-704d-4456-9518-04a60a632055': {
          id: 'deaf860f-704d-4456-9518-04a60a632055',
          name: 'success',
          description: '',
          res: {
            message: 'hello world',
          },
          exec: null,
          url: null,
          type: 'obj',
          schema: 'type Query_SimpleExample_ {\n  message: String\n}',
          schemaTypeName: 'Query_SimpleExample_',
        },
        '3bdfaf3f-9244-46e3-9003-b3fd3c88227a': {
          id: '3bdfaf3f-9244-46e3-9003-b3fd3c88227a',
          name: 'response 2',
          description: '',
          res: {
            message: 'this is response 2',
          },
          exec: '(arg, context, info) => {\n\tconst res = {\n\t\t"message": "message from function",\n\t}\n\treturn res\n}',
          url: null,
          type: 'func',
          schema: 'type Query_SimpleExample_ {\n  message: String\n}',
          schemaTypeName: 'Query_SimpleExample_',
        },
      },
    },
  },
  type: 'GraphQl',
  name: 'Graphql parent',
  schemaPath: '',
  graphqlQueriesType: 'Query',
};

export const ExampleGraphqlNestedData: RouteParent = {
  id: 'ed522f73-d889-4d18-91b4-757b0e06c599',
  filename: 'nested_graphql_parent',
  path: '/graphql',
  routesHash: {},
  graphQlRouteHash: {
    '4501f261-a776-45a6-8b60-6d392a0e94ee': {
      id: '4501f261-a776-45a6-8b60-6d392a0e94ee',
      type: 'Query',
      name: 'schema',
      description: '',
      activeResponseId: '7174ff2d-6fcb-4c31-8b5b-2b86381e54ff',
      responsesHash: {
        '06e66376-7903-4c05-8db1-24805a4e5461': {
          id: '06e66376-7903-4c05-8db1-24805a4e5461',
          name: 'success',
          description: '',
          res: {
            details: {
              id: 'example id',
              list: [
                {
                  name: 'example1',
                },
                {
                  name: 'example2',
                },
                {
                  name: 'example3',
                },
                {
                  name: 'example4',
                },
              ],
            },
          },
          exec: null,
          url: null,
          type: 'obj',
          schema:
            'type Query_Schema_Path_to_Details_List__ {\n  name: String\n}\ntype Query_Schema_Path_to_Details_ {\n  id: String\n  list: [Query_Schema_Path_to_Details_List__]\n}\ntype Query_Schema_Path_to_ {\n  details: Query_Schema_Path_to_Details_\n}',
          schemaTypeName: 'Query_Schema_Path_to_',
        },
        '7174ff2d-6fcb-4c31-8b5b-2b86381e54ff': {
          id: '7174ff2d-6fcb-4c31-8b5b-2b86381e54ff',
          name: 'response 2',
          description: '',
          res: {
            details: {
              id: 'example id2',
              list: [
                {
                  name: 'name example1',
                },
                {
                  name: 'name example2',
                },
                {
                  name: 'name example3',
                },
              ],
            },
          },
          exec: null,
          url: null,
          type: 'obj',
          schema:
            'type Query_Schema_Path_to_Details_List__ {\n  name: String\n}\ntype Query_Schema_Path_to_Details_ {\n  id: String\n  list: [Query_Schema_Path_to_Details_List__]\n}\ntype Query_Schema_Path_to_ {\n  details: Query_Schema_Path_to_Details_\n}',
          schemaTypeName: 'Query_Schema_Path_to_',
        },
      },
    },
    'b506ad70-6ba0-42bc-9f75-e4268b238f08': {
      id: 'b506ad70-6ba0-42bc-9f75-e4268b238f08',
      type: 'Query',
      name: 'schemaWithParams(param: String!)',
      description: '',
      activeResponseId: 'f19e5eb0-5791-4ccf-9763-440f936639c5',
      responsesHash: {
        'f7cf379d-86b0-42ff-900e-e2b4e9b2dd2d': {
          id: 'f7cf379d-86b0-42ff-900e-e2b4e9b2dd2d',
          name: 'success',
          description: '',
          res: {
            details: {
              id: 'example id',
              list: [
                {
                  name: 'example1',
                },
                {
                  name: 'example2',
                },
                {
                  name: 'example3',
                },
                {
                  name: 'example4',
                },
              ],
            },
          },
          exec: null,
          url: null,
          type: 'obj',
          schema:
            'type Query_SchemaWithParams_Path_to_Details_List__ {\n  name: String\n}\ntype Query_SchemaWithParams_Path_to_Details_ {\n  id: String\n  list: [Query_SchemaWithParams_Path_to_Details_List__]\n}\ntype Query_SchemaWithParams_Path_to_ {\n  details: Query_SchemaWithParams_Path_to_Details_\n}',
          schemaTypeName: 'Query_SchemaWithParams_Path_to_',
        },
        'f19e5eb0-5791-4ccf-9763-440f936639c5': {
          id: 'f19e5eb0-5791-4ccf-9763-440f936639c5',
          name: 'response 2',
          description: '',
          res: {
            details: {
              id: 'example id2',
              list: [
                {
                  name: 'name example1',
                },
                {
                  name: 'name example2',
                },
                {
                  name: 'name example3',
                },
              ],
            },
          },
          exec: null,
          url: null,
          type: 'obj',
          schema:
            'type Query_SchemaWithParams_Path_to_Details_List__ {\n  name: String\n}\ntype Query_SchemaWithParams_Path_to_Details_ {\n  id: String\n  list: [Query_SchemaWithParams_Path_to_Details_List__]\n}\ntype Query_SchemaWithParams_Path_to_ {\n  details: Query_SchemaWithParams_Path_to_Details_\n}',
          schemaTypeName: 'Query_SchemaWithParams_Path_to_',
        },
      },
    },
  },
  type: 'GraphQl',
  name: 'Graphql nested parent',
  schemaPath: 'path.to',
  graphqlQueriesType: 'Query',
};

export const ExamplePresets: PresetsFolder = {
  id: 'f8451db2-3a6b-45eb-ad2e-dbf5870be4d6',
  filename: 'PresetFolder',
  name: 'PresetFolder',
  presetsHash: {
    '6dd7cd4a-e1b0-4fe8-99ab-d621c35fe111': {
      id: '6dd7cd4a-e1b0-4fe8-99ab-d621c35fe111',
      description: 'Example of preset',
      name: 'presetExample',
      routesHash: {
        '30b8fa78-aad2-41f0-a2a1-5f951e538daf': {
          id: '30b8fa78-aad2-41f0-a2a1-5f951e538daf',
          routeId: '4501f261-a776-45a6-8b60-6d392a0e94ee',
          parentId: 'ed522f73-d889-4d18-91b4-757b0e06c599',
          serverId: 'ExampleServer',
          responseId: '7174ff2d-6fcb-4c31-8b5b-2b86381e54ff',
        },
        'eb2aa924-69c9-4386-bb32-034098503af1': {
          id: 'eb2aa924-69c9-4386-bb32-034098503af1',
          routeId: 'c336c107-b649-49f0-beca-fc16458984ca',
          parentId: '37d6038e-d706-43b8-a924-a61521e92702',
          serverId: 'ExampleServer',
          responseId: 'deaf860f-704d-4456-9518-04a60a632055',
        },
        '4612f0e9-bcdb-4b57-845c-42758eda60bd': {
          id: '4612f0e9-bcdb-4b57-845c-42758eda60bd',
          routeId: '3a5dcb68-6e00-4c11-9edc-272081a71262',
          parentId: 'c3d0aa64-28ca-48ea-87fe-80fd5ac028b7',
          serverId: 'ExampleServer',
          responseId: '1a4d6a7f-e56a-40dd-8d4e-e398daa92484',
        },
        'f73d05e3-e5c7-4bd8-95d8-4bc7dcbe0cd6': {
          id: 'f73d05e3-e5c7-4bd8-95d8-4bc7dcbe0cd6',
          routeId: '6d4aa7ed-a23b-4b1e-a48b-83ca7ca5f1b9',
          parentId: 'c3d0aa64-28ca-48ea-87fe-80fd5ac028b7',
          serverId: 'ExampleServer',
          responseId: '4b616f18-218d-4c0d-9967-20404cda37e9',
        },
      },
    },
  },
};
