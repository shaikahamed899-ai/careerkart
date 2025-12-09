const express = require('express');
const router = express.Router();
const interviewBotController = require('../controllers/interviewBotController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Interview Bot
router.post('/bot/start', interviewBotController.startSession);
router.post('/bot/:sessionId/answer', interviewBotController.submitAnswer);
router.get('/bot/:sessionId', interviewBotController.getSession);
router.post('/bot/:sessionId/end', interviewBotController.endSession);
router.get('/bot/history', interviewBotController.getHistory);

module.exports = router;
