var express = require('express');
const qcReportController = require('../controllers/QcReportController');
var router = express.Router();

router.get('/getRequestSamples', qcReportController.getRequestSamples);

module.exports = router;