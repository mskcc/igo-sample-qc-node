var express = require('express');
const qcReportController = require('../controllers/QcReportController');
var router = express.Router();

router.get('/getRequestSamples', qcReportController.getRequestSamples);
// router.get('/getComments', qcReportController.getComments);
router.post('/getQcReportSamples', qcReportController.getQcReportSamples);
router.post('/savePartialSubmission', qcReportController.savePartialSubmission);

module.exports = router;