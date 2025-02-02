import request from 'supertest';
import express from 'express';
import { faqRoutes } from '../../api/v1/faq/faq.routes.js'; // Import your actual routes
import mongoose from 'mongoose';
import { FAQ } from '../../api/v1/models/FAQ.js'; // Import your FAQ model

jest.mock('../../api/v1/models/FAQ.js'); // Mocking the FAQ model

// Create an Express app and apply routes for testing
const app = express();
app.use(express.json());
app.use('/api/v1/faq', faqRoutes);

// Mock MongoDB connection before running tests
beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/test_faq_db', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Close MongoDB connection after tests are finished
afterAll(async () => {
  await mongoose.connection.close();
});

// Unit test to create FAQ
describe('POST /api/v1/faq', () => {
  it('should create a new FAQ entry', async () => {
    const faqData = {
      question: 'What is Node.js?',
      answer: 'Node.js is a JavaScript runtime built on Chrome\'s V8 JavaScript engine.',
      language: 'en',
    };

    // Mock FAQ creation
    FAQ.create.mockResolvedValue(faqData);

    const response = await request(app).post('/api/v1/faq').send(faqData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('question', faqData.question);
    expect(response.body).toHaveProperty('answer', faqData.answer);
    expect(response.body).toHaveProperty('language', faqData.language);
  });

  it('should return 400 if required fields are missing', async () => {
    const faqData = {
      question: 'What is Node.js?', // Missing 'answer' field
      language: 'en',
    };

    const response = await request(app).post('/api/v1/faq').send(faqData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message', 'Answer is required');
  });
});

// Unit test to get FAQ by ID
describe('GET /api/v1/faq/:id', () => {
  it('should return the FAQ by ID', async () => {
    const faqId = '60dbf7e3b4f1a145b9e9256b'; // Example MongoDB ObjectId
    const faqData = {
      _id: faqId,
      question: 'What is Node.js?',
      answer: 'Node.js is a JavaScript runtime built on Chrome\'s V8 JavaScript engine.',
      language: 'en',
    };

    // Mock FAQ retrieval by ID
    FAQ.findById.mockResolvedValue(faqData);

    const response = await request(app).get(`/api/v1/faq/${faqId}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('_id', faqId);
    expect(response.body).toHaveProperty('question', faqData.question);
    expect(response.body).toHaveProperty('answer', faqData.answer);
  });

  it('should return 404 if FAQ is not found', async () => {
    const faqId = '60dbf7e3b4f1a145b9e9256b'; // Example MongoDB ObjectId

    // Mock FAQ retrieval to return null (not found)
    FAQ.findById.mockResolvedValue(null);

    const response = await request(app).get(`/api/v1/faq/${faqId}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'FAQ not found');
  });
});

// Unit test to update FAQ
describe('PUT /api/v1/faq/:id', () => {
  it('should update an existing FAQ entry', async () => {
    const faqId = '60dbf7e3b4f1a145b9e9256b'; // Example MongoDB ObjectId
    const faqData = {
      question: 'What is Node.js?',
      answer: 'Node.js is a JavaScript runtime built on Chrome\'s V8 JavaScript engine.',
      language: 'en',
    };

    // Mock FAQ update
    FAQ.findByIdAndUpdate.mockResolvedValue({ ...faqData, _id: faqId });

    const response = await request(app)
      .put(`/api/v1/faq/${faqId}`)
      .send(faqData);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('_id', faqId);
    expect(response.body).toHaveProperty('question', faqData.question);
    expect(response.body).toHaveProperty('answer', faqData.answer);
  });

  it('should return 404 if FAQ to update is not found', async () => {
    const faqId = '60dbf7e3b4f1a145b9e9256b'; // Example MongoDB ObjectId

    // Mock FAQ retrieval to return null (not found)
    FAQ.findByIdAndUpdate.mockResolvedValue(null);

    const response = await request(app)
      .put(`/api/v1/faq/${faqId}`)
      .send({ question: 'What is Node.js?', answer: 'Updated answer' });

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'FAQ not found');
  });
});

// Unit test to delete FAQ
describe('DELETE /api/v1/faq/:id', () => {
  it('should delete the FAQ entry', async () => {
    const faqId = '60dbf7e3b4f1a145b9e9256b'; // Example MongoDB ObjectId

    // Mock FAQ deletion
    FAQ.findByIdAndDelete.mockResolvedValue({ _id: faqId });

    const response = await request(app).delete(`/api/v1/faq/${faqId}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'FAQ deleted successfully');
  });

  it('should return 404 if FAQ to delete is not found', async () => {
    const faqId = '60dbf7e3b4f1a145b9e9256b'; // Example MongoDB ObjectId

    // Mock FAQ deletion to return null (not found)
    FAQ.findByIdAndDelete.mockResolvedValue(null);

    const response = await request(app).delete(`/api/v1/faq/${faqId}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'FAQ not found');
  });
});
