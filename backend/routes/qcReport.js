var express = require('express');
const qcReportController = require('../controllers/QcReportController');
var router = express.Router();

router.get('/getRequestSamples', qcReportController.getRequestSamples);
router.get('/getComments', qcReportController.getComments);
router.post('/addAndNotifyInitial', qcReportController.addAndNotifyInitial);
router.post('/getQcReportSamples', qcReportController.getQcReportSamples);
router.post('/savePartialSubmission', qcReportController.savePartialSubmission);
router.post('/setQCInvestigatorDecision', qcReportController.setQCInvestigatorDecision);

module.exports = router;