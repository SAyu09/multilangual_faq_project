import express from 'express';
import {
  createFAQ,
  getFAQs,
  getFAQById,
  updateFAQ,
  deleteFAQ,
} from './faq.controller.js';
import { validateFAQ } from './faq.validator.js';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getFAQs);
router.get('/:id', getFAQById);

router.post('/', authMiddleware, adminMiddleware, validateFAQ, createFAQ);
router.put('/:id', authMiddleware, adminMiddleware, validateFAQ, updateFAQ);
router.delete('/:id', authMiddleware, adminMiddleware, deleteFAQ);

export const faqRoutes = router;