var express = require('express');
const pendingController = require('../controllers/PendingController');
var router = express.Router();

router.post('/getPendingRequests', pendingController.getPendingRequests);

module.exports = router;
