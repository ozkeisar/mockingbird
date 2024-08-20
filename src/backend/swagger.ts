import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    version: 'v0.0.6',
    title: 'Mockingbird API documentation',
    description:
      'A list of an api endpoints to interact with Mockingbird using api calls',
  },
  servers: [
    {
      url: 'http://localhost:1512',
      description: '',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
      },
    },
  },
};

const outputFile = './src/backend/swagger_output.json';
const endpointsFiles = ['./src/backend/routers/index.ts'];

swaggerAutogen({ openapi: '3.0.0' })(outputFile, endpointsFiles, doc);
