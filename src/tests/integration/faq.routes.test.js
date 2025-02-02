import request from 'supertest';
import { app } from '../../app.mjs';
import mongoose from 'mongoose';
import { FAQ } from '../../models/faq.js'; 

// Setup and teardown for tests
beforeAll(async () => {
  // Connect to a test database before running tests
  const mongoURI = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/faq-api-test';
  await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  // Close the database connection after tests
  await mongoose.connection.close();
});

beforeEach(async () => {
  // Clear the FAQ collection before each test
  await FAQ.deleteMany({});
});

describe('FAQ Routes', () => {
  // Test the GET /api/v1/faq route (Fetch all FAQs)
  it('should fetch all FAQs', async () => {
    // First, create some sample FAQs
    await FAQ.create({ question: 'What is Node.js?', answer: 'Node.js is a JavaScript runtime.' });
    await FAQ.create({ question: 'What is Express?', answer: 'Express is a web framework for Node.js.' });

    const response = await request(app)
      .get('/api/v1/faq')
      .expect(200);

    // Check if the response has the correct structure
    expect(response.body).toHaveLength(2);
    expect(response.body[0]).toHaveProperty('question', 'What is Node.js?');
    expect(response.body[1]).toHaveProperty('question', 'What is Express?');
  });

  // Test the POST /api/v1/faq route (Create an FAQ)
  it('should create a new FAQ', async () => {
    const newFAQ = {
      question: 'What is MongoDB?',
      answer: 'MongoDB is a NoSQL database.',
    };

    const response = await request(app)
      .post('/api/v1/faq')
      .send(newFAQ)
      .expect(201);

    // Check if the FAQ was created
    expect(response.body).toHaveProperty('question', newFAQ.question);
    expect(response.body).toHaveProperty('answer', newFAQ.answer);

    // Check if the FAQ was saved in the database
    const faqInDB = await FAQ.findOne({ question: newFAQ.question });
    expect(faqInDB).not.toBeNull();
  });

  // Test the PUT /api/v1/faq/:id route (Update an FAQ)
  it('should update an existing FAQ', async () => {
    // Create a sample FAQ
    const faq = await FAQ.create({
      question: 'What is JavaScript?',
      answer: 'JavaScript is a programming language.',
    });

    const updatedFAQ = {
      question: 'What is JavaScript used for?',
      answer: 'JavaScript is used for web development.',
    };

    const response = await request(app)
      .put(`/api/v1/faq/${faq._id}`)
      .send(updatedFAQ)
      .expect(200);

    // Check if the FAQ was updated
    expect(response.body).toHaveProperty('question', updatedFAQ.question);
    expect(response.body).toHaveProperty('answer', updatedFAQ.answer);

    // Check if the FAQ in the database is updated
    const faqInDB = await FAQ.findById(faq._id);
    expect(faqInDB.question).toBe(updatedFAQ.question);
    expect(faqInDB.answer).toBe(updatedFAQ.answer);
  });

  // Test the DELETE /api/v1/faq/:id route (Delete an FAQ)
  it('should delete an FAQ', async () => {
    // Create a sample FAQ
    const faq = await FAQ.create({
      question: 'What is React?',
      answer: 'React is a JavaScript library for building user interfaces.',
    });

    const response = await request(app)
      .delete(`/api/v1/faq/${faq._id}`)
      .expect(200);

    // Check if the FAQ was deleted
    expect(response.body).toHaveProperty('message', 'FAQ deleted successfully.');

    // Check if the FAQ is removed from the database
    const faqInDB = await FAQ.findById(faq._id);
    expect(faqInDB).toBeNull();
  });

  // Test for GET /api/v1/faq/:id route (Fetch single FAQ)
  it('should fetch a single FAQ by id', async () => {
    // Create a sample FAQ
    const faq = await FAQ.create({
      question: 'What is TypeScript?',
      answer: 'TypeScript is a superset of JavaScript that adds static types.',
    });

    const response = await request(app)
      .get(`/api/v1/faq/${faq._id}`)
      .expect(200);

    // Check if the correct FAQ is returned
    expect(response.body).toHaveProperty('question', faq.question);
    expect(response.body).toHaveProperty('answer', faq.answer);
  });
});

