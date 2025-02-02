import FAQ from '../api/v1/models/faq.js';  

// Create a new FAQ
export const createFAQ = async (data) => {
  try {
    // Create and save a new FAQ document
    const faq = new FAQ({
      question: data.question,
      answer: data.answer,
      language: data.language || 'en', // Default to 'en' if no language is provided
    });

    await faq.save(); // Save the FAQ to the database
    return { success: true, message: 'FAQ created successfully', faq };
  } catch (err) {
    throw new Error('Error creating FAQ: ' + err.message);
  }
};

// Get all FAQs (can filter by language)
export const getFAQs = async (language = 'en') => {
  try {
    const faqs = await FAQ.find({ language }).exec();
    return { success: true, faqs };
  } catch (err) {
    throw new Error('Error fetching FAQs: ' + err.message);
  }
};

// Get a single FAQ by ID
export const getFAQById = async (id) => {
  try {
    const faq = await FAQ.findById(id).exec();
    if (!faq) {
      throw new Error('FAQ not found');
    }
    return { success: true, faq };
  } catch (err) {
    throw new Error('Error fetching FAQ by ID: ' + err.message);
  }
};

// Update an FAQ by ID
export const updateFAQ = async (id, data) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!faq) {
      throw new Error('FAQ not found');
    }
    return { success: true, message: 'FAQ updated successfully', faq };
  } catch (err) {
    throw new Error('Error updating FAQ: ' + err.message);
  }
};

// Delete an FAQ by ID
export const deleteFAQ = async (id) => {
  try {
    const faq = await FAQ.findByIdAndDelete(id).exec();
    if (!faq) {
      throw new Error('FAQ not found');
    }
    return { success: true, message: 'FAQ deleted successfully' };
  } catch (err) {
    throw new Error('Error deleting FAQ: ' + err.message);
  }
};

// Search FAQs by question or answer (useful for multilingual support)
export const searchFAQs = async (query, language = 'en') => {
  try {
    const regex = new RegExp(query, 'i'); // Case-insensitive search
    const faqs = await FAQ.find({ 
      $or: [
        { question: { $regex: regex } },
        { answer: { $regex: regex } }
      ],
      language
    }).exec();
    return { success: true, faqs };
  } catch (err) {
    throw new Error('Error searching FAQs: ' + err.message);
  }
};
