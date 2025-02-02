import FAQ from '../../../models/faq.js';
import { cache } from '../../../config/cache.js';

/**
 * @desc    Create a new FAQ
 * @param   {Object} faqData - FAQ data (question, answer, language)
 * @returns {Promise<Object>} - Created FAQ
 */
export const createFAQ = async (faqData) => {
  const faq = await FAQ.create(faqData);
  await cache.del('faqs'); // Invalidate the FAQ cache
  return faq;
};

/**
 * @desc    Get all FAQs
 * @returns {Promise<Array>} - List of FAQs
 */
export const getFAQs = async () => {
  // Check if FAQs are cached
  const cachedFAQs = await cache.get('faqs');

  if (cachedFAQs) {
    return JSON.parse(cachedFAQs);
  }

  // Fetch FAQs from the database
  const faqs = await FAQ.find();

  // Cache the FAQs for future requests
  await cache.set('faqs', JSON.stringify(faqs), 'EX', 3600); // Cache for 1 hour

  return faqs;
};

/**
 * @desc    Get a single FAQ by ID
 * @param   {string} id - FAQ ID
 * @returns {Promise<Object>} - Found FAQ
 * @throws  {Error} - If FAQ is not found
 */
export const getFAQById = async (id) => {
  const faq = await FAQ.findById(id);

  if (!faq) {
    throw new Error('FAQ not found');
  }

  return faq;
};

/**
 * @desc    Update an FAQ by ID
 * @param   {string} id - FAQ ID
 * @param   {Object} updateData - Updated FAQ data (question, answer, language)
 * @returns {Promise<Object>} - Updated FAQ
 * @throws  {Error} - If FAQ is not found
 */
export const updateFAQ = async (id, updateData) => {
  const faq = await FAQ.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!faq) {
    throw new Error('FAQ not found');
  }

  await cache.del('faqs'); // Invalidate the FAQ cache
  return faq;
};

/**
 * @desc    Delete an FAQ by ID
 * @param   {string} id - FAQ ID
 * @returns {Promise<Object>} - Deleted FAQ
 * @throws  {Error} - If FAQ is not found
 */
export const deleteFAQ = async (id) => {
  const faq = await FAQ.findByIdAndDelete(id);

  if (!faq) {
    throw new Error('FAQ not found');
  }

  await cache.del('faqs'); // Invalidate the FAQ cache
  return faq;
};