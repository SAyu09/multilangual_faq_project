import mongoose from 'mongoose';

const translationSchema = new mongoose.Schema({
  sourceText: { type: String, required: true },
  translatedText: { type: String, required: true },
  sourceLang: { type: String, required: true },
  targetLang: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Translation = mongoose.model('Translation', translationSchema);

export default Translation;
