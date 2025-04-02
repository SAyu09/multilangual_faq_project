import express from 'express';
import {
  createFAQ,
  getFAQs,
  getFAQById,
  updateFAQ,
  deleteFAQ,
} from './faq.controller.js';
import { validateCreateFAQ ,validateUpdateFAQ} from './faq.validator.js';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getFAQs);
router.get('/:id', getFAQById);

router.post('/', authMiddleware, adminMiddleware, validateCreateFAQ, createFAQ);
router.put('/:id', authMiddleware, adminMiddleware, validateUpdateFAQ, updateFAQ);
router.delete('/:id', authMiddleware, adminMiddleware, deleteFAQ);

export const faqRoutes = router;