import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

/**
 * Swagger configuration options.
 * @type {import('swagger-jsdoc').Options}
 */
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Multilingual FAQ API',
      version: '1.0.0', 
      description: 'API documentation for the Multilingual FAQ system',
      contact: {
        name: 'API Support',
        email: 'support@faqapi.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1', // Local development server
        description: 'Local development server',
      },
      {
        url: 'https://api.faqsystem.com/api/v1', // Production server
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        FAQ: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Unique identifier for the FAQ',
              example: '64f1b2b3c9e77b001a8e8e8e',
            },
            question: {
              type: 'object',
              description: 'FAQ question in multiple languages',
              properties: {
                en: { type: 'string', example: 'What is Node.js?' },
                es: { type: 'string', example: '¿Qué es Node.js?' },
                fr: { type: 'string', example: 'Qu\'est-ce que Node.js?' },
              },
            },
            answer: {
              type: 'object',
              description: 'FAQ answer in multiple languages',
              properties: {
                en: { type: 'string', example: 'Node.js is a runtime environment for executing JavaScript on the server.' },
                es: { type: 'string', example: 'Node.js es un entorno de ejecución para JavaScript en el servidor.' },
                fr: { type: 'string', example: 'Node.js est un environnement d\'exécution pour JavaScript sur le serveur.' },
              },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the FAQ was created',
              example: '2023-09-01T12:00:00Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the FAQ was last updated',
              example: '2023-09-01T12:00:00Z',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error',
            },
            message: {
              type: 'string',
              example: 'An error occurred while processing your request.',
            },
          },
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  // Paths to the API docs
  apis: ['./src/api/v1/**/*.routes.js'],
};

/**
 * Generates the Swagger specification using swagger-jsdoc.
 * @type {import('swagger-jsdoc').SwaggerDefinition}
 */
const swaggerSpec = swaggerJsdoc(swaggerOptions);

/**
 * Sets up Swagger UI and JSON documentation endpoints for an Express application.
 *
 * @param {import('express').Express} app - The Express application instance.
 */
export const setupSwagger = (app) => {
  // Serve the Swagger UI at /api-docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Serve the Swagger JSON specification at /api-docs.json
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.info('Swagger documentation is available at http://localhost:3000/api-docs');
};
