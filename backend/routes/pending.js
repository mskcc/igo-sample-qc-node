var express = require('express');
const pendingController = require('../controllers/PendingController');
var router = express.Router();

router.get('/getPendingRequests', pendingController.getPendingRequests);

module.exports = router;
