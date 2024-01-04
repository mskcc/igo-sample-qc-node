var express = require('express');
const qcReportController = require('../controllers/QcReportController');
var router = express.Router();

router.get('/getRequestSamples', qcReportController.getRequestSamples);
router.get('/getComments', qcReportController.getComments);

router.post('/addAndNotifyInitial', qcReportController.addAndNotifyInitial);
router.post('/addAndNotify', qcReportController.addAndNotify);
router.post('/addToAllAndNotify', qcReportController.addToAllAndNotify);

router.post('/getQcReportSamples', qcReportController.getQcReportSamples);

router.post('/savePartialSubmission', qcReportController.savePartialSubmission);
router.post('/setQCInvestigatorDecision', qcReportController.setQCInvestigatorDecision);

router.get('/downloadAttachment', qcReportController.downloadAttachment);

module.exports = router;