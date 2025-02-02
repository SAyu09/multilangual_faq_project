import amqplib from 'amqplib';
import mongoose from 'mongoose';
import Job from '../api/v1/models/Job.js'; // Job model for MongoDB

// RabbitMQ configuration
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost'; // Default to localhost if not defined
const QUEUE_NAME = 'jobQueue'; // The queue name to use

// Connect to RabbitMQ
let channel = null;

const connectRabbitMQ = async () => {
  try {
    const connection = await amqplib.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    console.log('Connected to RabbitMQ');
  } catch (err) {
    console.error('RabbitMQ connection error:', err);
    process.exit(1);
  }
};

// Push job to RabbitMQ queue
export const enqueueJob = async (taskName) => {
  try {
    if (!channel) await connectRabbitMQ(); // Ensure the channel is open
    
    // Create a new job in MongoDB
    const job = await Job.create({ taskName, status: 'queued' });

    // Send the job info to the queue
    channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify({ jobId: job._id, taskName })), {
      persistent: true, // Ensures the job is not lost if RabbitMQ crashes
    });

    console.log(`Job enqueued: ${taskName} (Job ID: ${job._id})`);

    return job._id;
  } catch (err) {
    console.error('Error enqueuing job:', err);
    throw err;
  }
};

// Process job from RabbitMQ queue
export const consumeJobs = async () => {
  try {
    if (!channel) await connectRabbitMQ(); // Ensure the channel is open

    console.log('Waiting for jobs...');

    channel.consume(QUEUE_NAME, async (msg) => {
      if (msg) {
        const jobData = JSON.parse(msg.content.toString());
        const { jobId, taskName } = jobData;

        console.log(`Processing job: ${taskName} (Job ID: ${jobId})`);

        try {
          // Update job status to 'processing' in MongoDB
          await Job.findByIdAndUpdate(jobId, { status: 'processing' });

          // Simulate task processing (e.g., performing async work)
          const result = await processTask(taskName); // Simulate task logic
          
          // Update the job status and result in MongoDB
          await Job.findByIdAndUpdate(jobId, { status: 'completed', result });

          // Acknowledge the message (RabbitMQ)
          channel.ack(msg);

          console.log(`Job completed: ${taskName} (Job ID: ${jobId})`);
        } catch (err) {
          console.error(`Error processing job: ${taskName} (Job ID: ${jobId})`, err);
          
          // Update the job status to 'failed'
          await Job.findByIdAndUpdate(jobId, { status: 'failed', result: err.message });

          // Acknowledge the message even if it failed to prevent re-delivery
          channel.ack(msg);
        }
      }
    });
  } catch (err) {
    console.error('Error consuming jobs:', err);
    throw err;
  }
};

// Simulate task processing logic
const processTask = async (taskName) => {
  // Simulate a delay for processing
  await new Promise(resolve => setTimeout(resolve, 2000));
  return `Task ${taskName} completed successfully!`;
};

