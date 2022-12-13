import { getSchemaPath } from '@nestjs/swagger';

export const getPaginatedSchema = (model: string | any): any => {
  return {
    schema: {
      allOf: [
        {
          properties: {
            statusCode: { type: 'number' },
            message: { type: 'string' },
            payload: {
              properties: {
                data: {
                  type: 'array',
                  items: { $ref: getSchemaPath(model) },
                },
                meta: {
                  properties: {
                    totalItems: { type: 'number' },
                    itemCount: { type: 'number' },
                    itemsPerPage: { type: 'number' },
                    totalPages: { type: 'number' },
                    currentPage: { type: 'number' },
                  },
                },
              },
            },
          },
        },
      ],
    },
  };
};

export const getArraySchema = (model: string | any): any => {
  return {
    schema: {
      allOf: [
        {
          properties: {
            statusCode: { type: 'number' },
            message: { type: 'string' },
            payload: {
              properties: {
                data: {
                  type: 'array',
                  items: { $ref: getSchemaPath(model) },
                },
              },
            },
          },
        },
      ],
    },
  };
};

export const getGenericResponseSchema = (model?: string | any): any => {
  return {
    schema: {
      allOf: [
        {
          properties: {
            statusCode: { type: 'number' },
            message: { type: 'string' },
            payload: model
              ? { $ref: getSchemaPath(model) }
              : { type: 'string' },
          },
        },
      ],
    },
  };
};

export const getGenericErrorResponseSchema = (): any => {
  return {
    schema: {
      allOf: [
        {
          properties: {
            statusCode: { type: 'number' },
            error: { type: 'string' },
            message: {
              type: 'array',
              items: { $ref: getSchemaPath('string') },
            },
          },
        },
      ],
    },
  };
};
