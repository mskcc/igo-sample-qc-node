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
                }).then((decisionsResults) => {
                    let decisionsSamplesByReport = {
                        'DNA Report': [],
                        'RNA Report': [],
                        'Library Report': [],
                        'Pool Report': []
                    };
                    if (decisionsResults && decisionsResults.length > 0) {
                        decisionsResults.forEach(result => {
                            const resultReport = result.report;
                            const decisionsArr = eval(result.decisions);
                            const decisionSamples = decisionsArr[0].samples;
                            console.log(decisionSamples);
                            decisionsSamplesByReport[resultReport] = decisionSamples;
                        });
                        
                    }
                    console.log(decisionsSamplesByReport);
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
                                    decisionsSamplesByReport['DNA Report']
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
                                    decisionsSamplesByReport['RNA Report']
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
                                    decisionsSamplesByReport['Library Report']
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
                                    decisionsSamplesByReport['Pool Report']
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
                    return apiResponse.errorResponse(res, `ERROR querying MySQL database for decisions: ${e}`);
                });

            }).catch(e => {
                console.log(e);
                return apiResponse.errorResponse(res, `ERROR querying MySQL database for comment relations: ${e}`);
            });
        }).catch(error => {
            console.log(error);
            return apiResponse.errorResponse(res, `ERROR retrieving QC reports: ${error}`);
        });
    }
];

exports.savePartialSubmission = [
    function(req, res) {
        const reqData = req.body.data;
        const decisions = reqData.decisions;
        const requestId = reqData.request_id;
        const report = reqData.report;
        const username = reqData.username;

        if(!decisions || decisions.length === 0) {
            return apiResponse.errorResponse(res, 'No decisions to save.');
        }
        CommentRelation.findOne({
            where: {
                request_id: requestId,
                report: report
            }
        }).then(commentRelation => {
            const commentRelationId = commentRelation.id;
            Decisions.findAll({
                where: {
                    request_id: requestId,
                    report: report
                }
            }).then(decision => {
                if (decision && decision.is_submitted) {
                    return apiResponse.errorResponse(res, 'This decision was already submitted to IGO and cannot be saved. Contact IGO if you need to make changes.');
                } else if (decision && decision.length > 0) {
                    Decisions.update({
                        decisions: JSON.stringify(decisions),
                        is_submitted: false,
                        decision_maker: username,
                    }, {
                        where: {
                            request_id: requestId,
                            report: report
                        }
                    });
                    return apiResponse.successResponse(res, 'Decisions updated, not yet submitted to IGO.');
                } else {
                    Decisions.create({
                        decisions: JSON.stringify(decisions),
                        report: report,
                        request_id: requestId,
                        is_submitted: false,
                        decision_maker: username,
                        comment_relation_id: commentRelationId
                    });
                    return apiResponse.successResponse(res, 'Decisions saved, not yet submitted to IGO.');
                }
            }).catch(error => {
                return apiResponse.errorResponse(res, `Failed to save. Please contact an admin by emailing zzPDL_SKI_IGO_DATA@mskcc.org. ${error}`);
            });
        }).catch(error => {
            return apiResponse.errorResponse(res, `Failed to save. Please contact an admin by emailing zzPDL_SKI_IGO_DATA@mskcc.org. ${error}`);
        });
        
    }
];

// exports.getComments = [
//     param('request_id').exists().withMessage('request ID must be specified.'),
//     function(req, res) {
//         const requestId = req.param.request_id;
//     }
// ]
