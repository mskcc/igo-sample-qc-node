const services = require('../services/services');
const apiResponse = require('../util/apiResponse');
const { query } = require('express-validator');
const db = require('../models');
const {
    sharedColumns,
    dnaColumns,
    rnaColumns,
    libraryColumns,
    poolColumns,
    pathologyColumns,
    attachmentColumns,
    dnaOrder,
    rnaOrder,
    libraryOrder,
    poolOrder,
    pathologyOrder,
    attachmentOrder
} = require('../constants');
const {
    isDecisionMade,
    mergeColumns,
    buildTableHTML,
    isUserAuthorizedForRequest
} = require('../util/helpers');
const Decisions = db.decisions;
const CommentRelation = db.commentRelations;


exports.getRequestSamples = [
    query('request_id').exists().withMessage('request ID must be specified.'),
    function (req, res) {
        const requestId = req.query.request_id;
        // TODO check user accessibility for request
        // const user = req.query.user;
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
                requestSamples.samples.forEach(sample => {
                    responseData['request']['samples'].push(sample['investigatorSampleId']);
                });

                return apiResponse.successResponseWithData(res, 'success', responseData);

            } else {
                return apiResponse.errorResponse(res, 'Associated request not found.');
            }
        }).catch(e => {
            console.log(e);
            return apiResponse.errorResponse(res, `ERROR getting request samples: ${e}`);
        });
    }
];

exports.getQcReportSamples = [
    function(req, res) {
        const reqData = req.body.data;
        const requestId = reqData.request;
        const samples = reqData.samples;
        const user = reqData.user;

        const isLabMember = user.role === 'lab_member';
        const isCmoPm = user.role === 'cmo_pm';

        const reports = [];
        const samplesAsString = samples.toString();

        const qcReportPromise = services.getQcReportSamples(requestId, samplesAsString);
        const picklistPromise = services.getPicklist();

        Promise.all([qcReportPromise, picklistPromise]).then(results => {
            if(!results) {
                return apiResponse.errorResponse(res, 'Cannot find report data');
            }
            let [qcReportResults, picklistResults] = results;

            let isCmoPmOnly = false;
            let isCmoPmOnlyAndNotPmUser = false;

            CommentRelation.findAll({
                where: {
                    request_id: requestId
                }
            }).then((commentRelationsResponse) => {
                const isAuthed = isLabMember || isUserAuthorizedForRequest(commentRelationsResponse, user);
                if (!isAuthed) {
                    return apiResponse.notFoundResponse(res, 'Request not found or associated with your username.');
                }

                commentRelationsResponse.forEach(commentRelation => {
                    reports.push(commentRelation.dataValues.report);
                    isCmoPmOnly = commentRelation.dataValues.is_cmo_pm_project;
                });
                isCmoPmOnlyAndNotPmUser = isCmoPmOnly && !isCmoPm;

                let constantColumnFeatures = {};
                const tables = {};
                let readOnly = true;

                Decisions.findAll({
                    where: {
                        request_id: requestId,
                        is_submitted: false
                    }
                }).then((decisionsResponse) => {
                    console.log(decisionsResponse);
                });

                for (let field of Object.keys(qcReportResults)) {
                    if (field === 'dnaReportSamples') {
                        if (reports.includes('DNA Report')) {
                            readOnly = isCmoPmOnlyAndNotPmUser || isDecisionMade(qcReportResults[field]);
                            constantColumnFeatures = mergeColumns(sharedColumns, dnaColumns);
                            constantColumnFeatures.InvestigatorDecision.readOnly = readOnly;
                            constantColumnFeatures.InvestigatorDecision.source = picklistResults;

                            tables[field] = buildTableHTML(
                                field,
                                qcReportResults[field],
                                constantColumnFeatures,
                                dnaOrder,
                                // decisionsResults
                            );
                            tables[field]['readOnly'] = readOnly;
                            tables[field]['isCmoPmProject'] = isCmoPmOnly;
                        }
                    }
                    if (field === 'rnaReportSamples') {
                        if (reports.includes('RNA Report')) {
                            readOnly = isDecisionMade(qcReportResults[field]) || isCmoPmOnlyAndNotPmUser;
                            constantColumnFeatures = mergeColumns(sharedColumns, rnaColumns);
                            constantColumnFeatures.InvestigatorDecision.readOnly = readOnly;
                            constantColumnFeatures.InvestigatorDecision.source = picklistResults;

                            tables[field] = buildTableHTML(
                                field,
                                qcReportResults[field],
                                constantColumnFeatures,
                                rnaOrder,
                                // decisionsResults
                            );
                            tables[field]['readOnly'] = readOnly;
                            tables[field]['isCmoPmProject'] = isCmoPmOnly;
                        }
                    }
                    if (field === 'libraryReportSamples') {
                        if (reports.includes('Library Report')) {
                            readOnly = isDecisionMade(qcReportResults[field]) || isCmoPmOnlyAndNotPmUser;
                            constantColumnFeatures = mergeColumns(sharedColumns, libraryColumns);
                            constantColumnFeatures.InvestigatorDecision.readOnly = readOnly;
                            constantColumnFeatures.InvestigatorDecision.source = picklistResults;

                            tables[field] = buildTableHTML(
                                field,
                                qcReportResults[field],
                                constantColumnFeatures,
                                libraryOrder,
                                // decisionsResults
                            );
                            tables[field]['readOnly'] = readOnly;
                            tables[field]['isCmoPmProject'] = isCmoPmOnly;
                        }
                    }
                    if (field === 'poolReportSamples') {
                        if (reports.includes('Pool Report')) {
                            readOnly = isDecisionMade(qcReportResults[field]) || isCmoPmOnlyAndNotPmUser;
                            constantColumnFeatures = mergeColumns(sharedColumns, poolColumns);
                            constantColumnFeatures.InvestigatorDecision.readOnly = readOnly;
                            constantColumnFeatures.InvestigatorDecision.source = picklistResults;

                            tables[field] = buildTableHTML(
                                field,
                                qcReportResults[field],
                                constantColumnFeatures,
                                poolOrder,
                                // decisionsResults
                            );
                            tables[field]['readOnly'] = readOnly;
                            tables[field]['isCmoPmProject'] = isCmoPmOnly;
                        }
                    }
                    if (field === 'pathologyReportSamples') {
                        if (reports.includes('Pathology Report')) {

                            tables[field] = buildTableHTML(
                                field,
                                qcReportResults[field],
                                pathologyColumns,
                                pathologyOrder
                            );
                            tables[field]['readOnly'] = true;
                            readOnly = true;
                        }
                    }
                    if (field === 'attachments') {
                        tables[field] = buildTableHTML(
                            field,
                            qcReportResults[field],
                            attachmentColumns,
                            attachmentOrder
                        );
                    }
                    
                }

                const responseObject = {
                    tables,
                    read_only: readOnly
                };

                return apiResponse.successResponseWithData(res, 'successfully retrieved table data', responseObject);

            }).catch(e => {
                console.log(e);
                return apiResponse.errorResponse(res, `ERROR querying MySQL database: ${e}`);
            });
        }).catch(error => {
            console.log(error);
            return apiResponse.errorResponse(res, `ERROR retrieving QC reports: ${error}`, error);
        });
    }
];

