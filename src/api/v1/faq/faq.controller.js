import mongoose from 'mongoose';
import { cache } from "../../../../config/cache.js"
import { ApiResponse } from "../../../utlis/apiResponce.js"
import { asyncHandler } from "../../../utlis/acyncHandler.js"
import FAQ from '../../../models/faq.js';


/**
 * @desc    Create a new FAQ
 * @route   POST /api/v1/faq
 * @access  Private (Admin only)
 */
export const createFAQ = asyncHandler(async (req, res) => {
  const { question, answer, language } = req.body;

  // Validate required fields
  if (!question || !answer || !language) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, 'Question, answer, and language are required'));
  }

  // Create a new FAQ document in the database
  const faq = await FAQ.create({ question, answer, language });

  // Invalidate the FAQ cache to ensure fresh data is fetched next time
  await cache.del('faqs');

  // Return success response with the created FAQ
  return res
    .status(201)
    .json(new ApiResponse(201, faq, 'FAQ created successfully'));
});

/**
 * @desc    Get all FAQs
 * @route   GET /api/v1/faq
 * @access  Public
 */
export const getFAQs = asyncHandler(async (req, res) => {
  // Check if FAQs are cached to reduce database load
  const cachedFAQs = await cache.get('faqs');

  if (cachedFAQs) {
    return res
      .status(200)
      .json(new ApiResponse(200, JSON.parse(cachedFAQs), 'FAQs retrieved from cache'));
  }

  // Fetch all FAQs from the database
  const faqs = await FAQ.find();

  // Cache the FAQs for future requests with a TTL of 1 hour
  await cache.set('faqs', JSON.stringify(faqs), 'EX', 3600);

  // Return success response with the fetched FAQs
  return res
    .status(200)
    .json(new ApiResponse(200, faqs, 'FAQs retrieved successfully'));
});

/**
 * @desc    Get a single FAQ by ID
 * @route   GET /api/v1/faq/:id
 * @access  Public
 */
export const getFAQById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate the ID format (assuming it's a MongoDB ObjectId)
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, 'Invalid FAQ ID'));
  }

  // Find the FAQ by ID in the database
  const faq = await FAQ.findById(id);

  if (!faq) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, 'FAQ not found'));
  }

  // Return success response with the fetched FAQ
  return res
    .status(200)
    .json(new ApiResponse(200, faq, 'FAQ retrieved successfully'));
});

/**
 * @desc    Update an FAQ by ID
 * @route   PUT /api/v1/faq/:id
 * @access  Private (Admin only)
 */
export const updateFAQ = asyncHandler(async (req, res) => {
  const { id } = req.query;
  const { question, answer, language } = req.body;

  // Validate the ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, 'Invalid FAQ ID'));
  }

  // Find and update the FAQ document in the database
  const updatedFAQ = await FAQ.findByIdAndUpdate(
    id,
    { question, answer, language },
    { new: true, runValidators: true }
  );

  if (!updatedFAQ) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, 'FAQ not found'));
  }

  // Invalidate the FAQ cache to ensure fresh data is fetched next time
  await cache.del('faqs');

  // Return success response with the updated FAQ
  return res
    .status(200)
    .json(new ApiResponse(200, updatedFAQ, 'FAQ updated successfully'));
});

/**
 * @desc    Delete an FAQ by ID
 * @route   DELETE /api/v1/faq/:id
 * @access  Private (Admin only)
 */
export const deleteFAQ = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate the ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, 'Invalid FAQ ID'));
  }

  // Find and delete the FAQ document in the database
  const deletedFAQ = await FAQ.findByIdAndDelete(id);

  if (!deletedFAQ) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, 'FAQ not found'));
  }

  // Invalidate the FAQ cache to ensure fresh data is fetched next time
  await cache.del('faqs');

  // Return success response indicating the FAQ was deleted
  return res
    .status(200)
    .json(new ApiResponse(200, null, 'FAQ deleted successfully'));
});