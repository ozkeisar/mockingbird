import { v4 as uuid } from 'uuid';
import { RouteResponse, Method } from '../types';

/**
 * Common HTTP status codes with their standard messages and descriptions
 */
export const DEFAULT_STATUS_CODES = {
  200: { message: 'OK', description: 'Successful request' },
  201: { message: 'Created', description: 'Resource created successfully' },
  400: { message: 'Bad Request', description: 'Invalid request data' },
  401: { message: 'Unauthorized', description: 'Authentication required' },
  403: { message: 'Forbidden', description: 'Access denied' },
  404: { message: 'Not Found', description: 'Resource not found' },
  500: {
    message: 'Internal Server Error',
    description: 'Server error occurred',
  },
} as const;

/**
 * Default response data based on HTTP method and status code
 */
const getDefaultResponseData = (method: Method, statusCode: number): any => {
  const methodLower = method.toLowerCase();

  switch (statusCode) {
    case 200:
      if (methodLower === 'get') {
        return {
          message: 'Data retrieved successfully',
          data: {},
        };
      }
      if (methodLower === 'put' || methodLower === 'patch') {
        return {
          message: 'Resource updated successfully',
          updated: true,
        };
      }
      if (methodLower === 'delete') {
        return {
          message: 'Resource deleted successfully',
          deleted: true,
        };
      }
      if (methodLower === 'post') {
        return {
          message: 'Resource processed successfully',
          success: true,
        };
      }
      return {
        message: 'Request processed successfully',
        success: true,
      };

    case 201:
      return {
        message: 'Resource created successfully',
        id: 'new-resource-id',
        created: true,
      };

    case 400:
      return {
        error: 'Bad Request',
        message: 'The request could not be understood by the server',
        details: 'Please check your request parameters and try again',
      };

    case 401:
      return {
        error: 'Unauthorized',
        message: 'Authentication is required to access this resource',
        details: 'Please provide valid authentication credentials',
      };

    case 403:
      return {
        error: 'Forbidden',
        message: 'You do not have permission to access this resource',
        details: 'Contact your administrator if you believe this is an error',
      };

    case 404:
      return {
        error: 'Not Found',
        message: 'The requested resource could not be found',
        details: 'Please check the URL and try again',
      };

    case 500:
      return {
        error: 'Internal Server Error',
        message: 'An unexpected error occurred on the server',
        details:
          'Please try again later or contact support if the problem persists',
      };

    default:
      return {
        message: 'Response',
        statusCode,
      };
  }
};

/**
 * Get the default status codes to create based on HTTP method
 */
export const getDefaultStatusCodesForMethod = (method: Method): number[] => {
  const methodLower = method.toLowerCase();

  switch (methodLower) {
    case 'get':
      return [200, 400, 401, 403, 404, 500];
    case 'post':
      return [200, 201, 400, 401, 403, 500];
    case 'put':
    case 'patch':
      return [200, 400, 401, 403, 404, 500];
    case 'delete':
      return [200, 400, 401, 403, 404, 500];
    default:
      return [200, 400, 401, 500];
  }
};

/**
 * Create a default response for a given status code and method
 */
export const createDefaultResponse = (
  statusCode: number,
  method: Method,
): RouteResponse => {
  const statusInfo =
    DEFAULT_STATUS_CODES[statusCode as keyof typeof DEFAULT_STATUS_CODES];
  const defaultData = getDefaultResponseData(method, statusCode);

  return {
    id: uuid(),
    name: statusInfo
      ? `${statusCode} ${statusInfo.message}`
      : `${statusCode} Response`,
    description: statusInfo
      ? statusInfo.description
      : `Default ${statusCode} response`,
    res: {
      code: statusCode,
      data: defaultData,
      headers: {
        'Content-Type': 'application/json',
      },
    },
    exec: null,
    url: null,
    type: 'obj' as const,
    blockProxy: null,
  };
};

/**
 * Create all default responses for a given HTTP method
 */
export const createDefaultResponsesForMethod = (
  method: Method,
): RouteResponse[] => {
  const statusCodes = getDefaultStatusCodesForMethod(method);
  return statusCodes.map((statusCode) =>
    createDefaultResponse(statusCode, method),
  );
};

/**
 * Create a hash of default responses with the first one (200/201) as active
 */
export const createDefaultResponsesHash = (
  method: Method,
): {
  responsesHash: { [key: string]: RouteResponse };
  activeResponseId: string;
} => {
  const defaultResponses = createDefaultResponsesForMethod(method);

  const responsesHash: { [key: string]: RouteResponse } = {};
  defaultResponses.forEach((response) => {
    responsesHash[response.id] = response;
  });

  // Set the first response (usually 200 or 201) as active
  const activeResponseId =
    defaultResponses.length > 0 ? defaultResponses[0].id : '';

  return {
    responsesHash,
    activeResponseId,
  };
};
