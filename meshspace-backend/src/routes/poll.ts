import express from 'express';
import { body } from 'express-validator';
import { authenticateToken } from '../middleware/authMiddleware';
import { generalLimiter } from '../middleware/security';
import {
  createPoll,
  votePoll,
  getPollResults,
  getUserPolls,
  deletePoll
} from '../controllers/pollController';

const router = express.Router();

// Validation middleware
const validatePollCreation = [
  body('question')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Question must be between 1 and 500 characters'),
  body('options')
    .isArray({ min: 2, max: 10 })
    .withMessage('Poll must have between 2 and 10 options'),
  body('options.*')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Each option must be between 1 and 200 characters'),
  body('expiresAt')
    .isISO8601()
    .withMessage('Expiration date must be a valid ISO 8601 date'),
  body('allowMultiple')
    .optional()
    .isBoolean()
    .withMessage('allowMultiple must be a boolean'),
  body('postId')
    .optional()
    .isMongoId()
    .withMessage('postId must be a valid MongoDB ObjectId')
];

const validateVote = [
  body('optionIndexes')
    .isArray({ min: 1 })
    .withMessage('At least one option must be selected'),
  body('optionIndexes.*')
    .isInt({ min: 0 })
    .withMessage('Option indexes must be non-negative integers')
];

// Apply rate limiting to all poll routes
router.use(generalLimiter);

// Create poll
router.post('/', authenticateToken, validatePollCreation, createPoll);

// Vote on poll
router.post('/:pollId/vote', authenticateToken, validateVote, votePoll);

// Get poll results
router.get('/:pollId/results', getPollResults);

// Get user's polls
router.get('/user/:userId', getUserPolls);

// Delete poll
router.delete('/:pollId', authenticateToken, deletePoll);

export default router;
