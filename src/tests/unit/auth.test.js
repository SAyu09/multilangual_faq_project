import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRoutes } from '../../api/v1/routes/user.routes.js'; // Import your routes

// Setup Express app for testing
const app = express();
app.use(express.json());
app.use('/api/v1/user', userRoutes); // Register routes

// Mock environment variables (e.g., JWT secret)
process.env.JWT_SECRET = 'mysecretkey'; 

// Setup in-memory MongoDB for testing (optional, for isolated test environment)
beforeAll(async () => {
  const mongoURI = 'mongodb://localhost:27017/test'; // Test DB URI
  await mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Auth API tests', () => {
  let testUser;

  beforeEach(async () => {
    // Create a new user for each test
    testUser = {
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: 'password123',
    };

    // Hash the password before saving
    testUser.password = await bcrypt.hash(testUser.password, 10);
  });

  test('should register a new user successfully', async () => {
    const response = await request(app)
      .post('/api/v1/user/register')
      .send(testUser);

    expect(response.status).toBe(201); // Expect status 201 for successful registration
    expect(response.body.message).toBe('User registered successfully!');
  });

  test('should not register a user with an existing email', async () => {
    // Register the first user
    await request(app).post('/api/v1/user/register').send(testUser);

    // Try to register the same user again
    const response = await request(app)
      .post('/api/v1/user/register')
      .send(testUser);

    expect(response.status).toBe(400); // Expect a conflict (400) for duplicate email
    expect(response.body.message).toBe('Email already exists!');
  });

  test('should login a user with valid credentials', async () => {
    // Register the user first
    await request(app).post('/api/v1/user/register').send(testUser);

    // Now log the user in
    const response = await request(app)
      .post('/api/v1/user/login')
      .send({
        email: testUser.email,
        password: 'password123',
      });

    expect(response.status).toBe(200); // Expect status 200 for successful login
    expect(response.body.message).toBe('User logged in successfully!');
    expect(response.body.token).toBeDefined(); // Token should be returned
  });

  test('should not login with invalid password', async () => {
    // Register the user first
    await request(app).post('/api/v1/user/register').send(testUser);

    // Try logging in with incorrect password
    const response = await request(app)
      .post('/api/v1/user/login')
      .send({
        email: testUser.email,
        password: 'wrongpassword',
      });

    expect(response.status).toBe(400); // Expect status 400 for invalid credentials
    expect(response.body.message).toBe('Invalid credentials!');
  });

  test('should not login with non-existent email', async () => {
    const response = await request(app)
      .post('/api/v1/user/login')
      .send({
        email: 'nonexistentuser@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(400); // Expect status 400 for non-existent email
    expect(response.body.message).toBe('Invalid credentials!');
  });
});

