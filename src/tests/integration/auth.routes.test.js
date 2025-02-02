import request from 'supertest';
import { app } from '../../app.mjs'; // Import the Express app
import mongoose from 'mongoose';

// Set up a mock environment variable for testing (e.g., MongoDB URI)
process.env.MONGO_URI = 'mongodb://localhost:27017/test'; 

// A helper function to clean up the database between tests
const cleanDb = async () => {
  await mongoose.connection.dropDatabase();
};

// Sample user data for testing
const testUser = {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
};

beforeAll(async () => {
  // Connect to the test database before running tests
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  // Clean the database before each test
  await cleanDb();
});

afterAll(async () => {
  // Close the MongoDB connection after all tests
  await mongoose.connection.close();
});

describe('Authentication Routes', () => {
  // Test User Registration
  it('should register a new user and return status 201', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User registered successfully!');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user.email).toBe(testUser.email);
  });

  // Test User Login (Valid Credentials)
  it('should log in a user with valid credentials and return status 200', async () => {
    // First, register a user
    await request(app).post('/api/v1/auth/register').send(testUser);

    // Now, log in with the registered credentials
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.message).toBe('User logged in successfully!');
    expect(loginResponse.body).toHaveProperty('token');
  });

  // Test User Login (Invalid Credentials)
  it('should return status 400 for invalid login credentials', async () => {
    // Register a user
    await request(app).post('/api/v1/auth/register').send(testUser);

    // Try logging in with incorrect password
    const invalidLoginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: 'wrongpassword',
      });

    expect(invalidLoginResponse.status).toBe(400);
    expect(invalidLoginResponse.body.message).toBe('Invalid credentials');
  });

  // Test Missing Required Fields in Registration
  it('should return status 400 if registration fields are missing', async () => {
    const invalidUser = {
      email: 'missingname@example.com', // Missing name and password
    };

    const response = await request(app)
      .post('/api/v1/auth/register')
      .send(invalidUser);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('"name" is required');
  });

  // Test User Login (Missing Email)
  it('should return status 400 if email is missing in login request', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        password: testUser.password,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('"email" is required');
  });
});
