const express = require('express');
const router = express.Router();
const networkController = require('../controllers/networkController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Connections
router.get('/connections', networkController.getConnections);
router.get('/requests', networkController.getPendingRequests);
router.get('/suggestions', networkController.getSuggestions);

// Connection actions
router.post('/connect/:userId', networkController.sendConnectionRequest);
router.post('/accept/:connectionId', networkController.acceptConnection);
router.post('/reject/:connectionId', networkController.rejectConnection);
router.delete('/remove/:userId', networkController.removeConnection);

// Connection info
router.get('/status/:userId', networkController.getConnectionStatus);
router.get('/mutual/:userId', networkController.getMutualConnections);

module.exports = router;
