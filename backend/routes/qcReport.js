var express = require('express');
const qcReportController = require('../controllers/QcReportController');
var router = express.Router();

router.get('/getRequestSamples', qcReportController.getRequestSamples);
router.post('/getQcReportSamples', qcReportController.getQcReportSamples);

module.exports = router;