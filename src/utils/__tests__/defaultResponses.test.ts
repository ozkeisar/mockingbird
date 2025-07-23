import {
  createDefaultResponse,
  createDefaultResponsesForMethod,
  createDefaultResponsesHash,
  getDefaultStatusCodesForMethod,
  DEFAULT_STATUS_CODES,
} from '../defaultResponses';

describe('defaultResponses', () => {
  describe('getDefaultStatusCodesForMethod', () => {
    it('should return correct status codes for GET method', () => {
      const codes = getDefaultStatusCodesForMethod('get');
      expect(codes).toEqual([200, 400, 401, 403, 404, 500]);
    });

    it('should return correct status codes for POST method', () => {
      const codes = getDefaultStatusCodesForMethod('post');
      expect(codes).toEqual([200, 201, 400, 401, 403, 500]);
    });

    it('should return correct status codes for PUT method', () => {
      const codes = getDefaultStatusCodesForMethod('put');
      expect(codes).toEqual([200, 400, 401, 403, 404, 500]);
    });

    it('should return correct status codes for DELETE method', () => {
      const codes = getDefaultStatusCodesForMethod('delete');
      expect(codes).toEqual([200, 400, 401, 403, 404, 500]);
    });
  });

  describe('createDefaultResponse', () => {
    it('should create a valid response object for 200 OK', () => {
      const response = createDefaultResponse(200, 'get');

      expect(response).toHaveProperty('id');
      expect(response.name).toBe('200 OK');
      expect(response.description).toBe('Successful request');
      expect(response.type).toBe('obj');
      expect(response.res?.code).toBe(200);
      expect(response.res?.headers).toHaveProperty(
        'Content-Type',
        'application/json',
      );
    });

    it('should create different response data based on method', () => {
      const getResponse = createDefaultResponse(200, 'get');
      const postResponse = createDefaultResponse(200, 'post');

      expect(getResponse.res?.data).toHaveProperty(
        'message',
        'Data retrieved successfully',
      );
      expect(postResponse.res?.data).toHaveProperty(
        'message',
        'Resource processed successfully',
      );
    });

    it('should create error response for 400 status', () => {
      const response = createDefaultResponse(400, 'get');

      expect(response.name).toBe('400 Bad Request');
      expect(response.res?.data).toHaveProperty('error', 'Bad Request');
      expect(response.res?.data).toHaveProperty('message');
      expect(response.res?.data).toHaveProperty('details');
    });
  });

  describe('createDefaultResponsesForMethod', () => {
    it('should create the correct number of responses for GET method', () => {
      const responses = createDefaultResponsesForMethod('get');
      expect(responses).toHaveLength(6); // 200, 400, 401, 403, 404, 500
    });

    it('should create the correct number of responses for POST method', () => {
      const responses = createDefaultResponsesForMethod('post');
      expect(responses).toHaveLength(6); // 200, 201, 400, 401, 403, 500
    });

    it('should create responses with unique IDs', () => {
      const responses = createDefaultResponsesForMethod('get');
      const ids = responses.map((r) => r.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(responses.length);
    });
  });

  describe('createDefaultResponsesHash', () => {
    it('should create a hash with responses and active response ID', () => {
      const result = createDefaultResponsesHash('get');

      expect(result).toHaveProperty('responsesHash');
      expect(result).toHaveProperty('activeResponseId');
      expect(typeof result.responsesHash).toBe('object');
      expect(typeof result.activeResponseId).toBe('string');
    });

    it('should set the first response as active', () => {
      const result = createDefaultResponsesHash('get');
      const activeResponse = result.responsesHash[result.activeResponseId];

      expect(activeResponse).toBeDefined();
      expect(activeResponse.res?.code).toBe(200); // First status code should be 200
    });

    it('should create correct hash structure', () => {
      const result = createDefaultResponsesHash('post');
      const responseIds = Object.keys(result.responsesHash);

      expect(responseIds.length).toBe(6); // POST should have 6 responses
      expect(responseIds.includes(result.activeResponseId)).toBe(true);
    });
  });

  describe('DEFAULT_STATUS_CODES', () => {
    it('should contain all expected status codes', () => {
      const expectedCodes = [200, 201, 400, 401, 403, 404, 500];
      expectedCodes.forEach((code) => {
        expect(DEFAULT_STATUS_CODES).toHaveProperty(code.toString());
      });
    });

    it('should have message and description for each status code', () => {
      Object.entries(DEFAULT_STATUS_CODES).forEach(([, info]) => {
        expect(info).toHaveProperty('message');
        expect(info).toHaveProperty('description');
        expect(typeof info.message).toBe('string');
        expect(typeof info.description).toBe('string');
      });
    });
  });
});
