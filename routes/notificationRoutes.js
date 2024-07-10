const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

// Create a notification
router.post('/',  notificationController.createNotification);

// Get notifications for a user
router.get('/user/:userId',  notificationController.getNotificationsForUser);

// Delete a notification
router.delete('/:notificationId',  notificationController.deleteNotification);

module.exports = router;
