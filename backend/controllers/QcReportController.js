const services = require('../services/services');
const apiResponse = require('../util/apiResponse');
const { param } = require('express-validator');

exports.getRequestSamples = [
    param('request').exists().withMessage('request ID must be specified.'),
    function (req, res) {
        const requestId = req.param.request;
        // const user = req.param.user;
        const requestSamplesPromise = services.getRequestSamples(requestId);

        Promise.all([requestSamplesPromise]).then(results => {
            if (!results || results.length === 0) {
                return apiResponse.errorResponse(res, 'Could not find request data.');
            }

            let [requestSamples] = results;
            let responseData = {};

            if ('samples' in requestSamples) {
                responseData['request'] = {};
                responseData['request']['samples'] = [];
                responseData['recipients'] = {};

                responseData['request']['requestId'] = requestSamples['requestId'];
                responseData['request']['labHeadName'] = requestSamples['labHeadName'];
                responseData['request']['investigatorName'] = requestSamples['investigatorName'];
                responseData['request']['requestName'] = requestSamples['requestName'];

                responseData['recipients']['IGOEmail'] = 'zzPDL_IGO_Staff@mskcc.org';
                responseData['recipients']['LabHeadEmail'] = requestSamples['labHeadEmail'];
                responseData['recipients']['InvestigatorEmail'] = requestSamples['investigatorEmail'];

                if ('qcAccessEmails' in requestSamples && requestSamples['qcAccessEmails'] !== '') {
                    responseData['recipients']['QcAccessEmails'] = requestSamples['qcAccessEmails'];
                } else {
                    responseData['recipients']['OtherContactEmails'] = requestSamples['otherContactEmails'];
                }
                    
                // we only need Investigator Sample Ids
                for(let sample in requestSamples) {
                    responseData['request']['samples'].push(sample['investigatorSampleId']);
                }

                return apiResponse.successResponse(res, responseData);

            } else {
                return apiResponse.errorResponse(res, 'Associated request not found.');
            }
        });
    }
];

exports.getQcReportSamples = [
    function(req, res) {
        const requestId = req.body.request;
        const samples = req.body.samples;

        const qcReportPromise = services.getQcReportSamples({
            request: requestId,
            samples: samples
        });

        Promise.all([qcReportPromise]).then(results => {

        })
    }
];

// EXAMPLE MYSQL QUERY!!!

// mysqlLib.executeQuery('select * from inkdetails').then((d) => {
//     console.log(d);
//     res.status(200).send(d)
//   }).catch(e => {
//     console.log(e);
//     res.status(500).send('Sorry, something went wrong!')
//   })