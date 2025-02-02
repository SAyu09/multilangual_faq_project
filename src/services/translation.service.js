import { Translate } from '@google-cloud/translate';
import Translation from '../api/v1/models/Translation.js';
import { logger } from '../utils/logger.js'; // You can use your own logging mechanism

// Google Cloud Translate client setup
const translate = new Translate();

/**
 * Translates the input text from the source language to the target language.
 * 
 * @param {string} text - The text to translate
 * @param {string} targetLang - The target language for translation (e.g., 'en', 'es', 'fr')
 * @param {string} sourceLang - The source language for translation (optional, auto-detects)
 * @returns {Promise<object>} - The translation result
 */
export const translateText = async (text, targetLang, sourceLang = 'auto') => {
  try {
    // Perform translation using Google Cloud Translate API
    const [translation] = await translate.translate(text, { from: sourceLang, to: targetLang });

    // Log translation success
    logger.info(`Translated from ${sourceLang} to ${targetLang}: ${text} -> ${translation}`);

    // Save the translation to the database
    const translationRecord = new Translation({
      sourceText: text,
      translatedText: translation,
      sourceLang: sourceLang,
      targetLang: targetLang,
    });

    await translationRecord.save();

    return { translatedText: translation, sourceLang, targetLang };
  } catch (error) {
    // Log error
    logger.error(`Translation failed for text: ${text} from ${sourceLang} to ${targetLang}: ${error.message}`);
    throw new Error('Translation failed');
  }
};

/**
 * Retrieves all translations from the database.
 * 
 * @returns {Promise<Array>} - Array of all translation records
 */
export const getAllTranslations = async () => {
  try {
    const translations = await Translation.find().sort({ timestamp: -1 });
    return translations;
  } catch (error) {
    logger.error('Failed to retrieve translations from the database: ' + error.message);
    throw new Error('Failed to retrieve translations');
  }
};
