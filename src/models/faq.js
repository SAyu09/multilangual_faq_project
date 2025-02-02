import mongoose from 'mongoose';

// Define a schema for multilingual FAQ
const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    },
    language: {
      type: String,
      required: true,
      enum: ['en', 'es', 'fr', 'de', 'it'], // Example: List supported languages
      default: 'en',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Adding a method to get FAQs by language
faqSchema.statics.getFaqsByLanguage = async function (language) {
  return await this.find({ language }).sort({ createdAt: -1 });
};

// Adding a method to update FAQ details
faqSchema.methods.updateFaq = async function (updatedFaqData) {
  this.question = updatedFaqData.question || this.question;
  this.answer = updatedFaqData.answer || this.answer;
  this.language = updatedFaqData.language || this.language;
  this.updatedAt = Date.now();
  await this.save();
  return this;
};

// Define the FAQ model based on the schema
const FAQ = mongoose.model('FAQ', faqSchema);

export const FAQModel = FAQ;
