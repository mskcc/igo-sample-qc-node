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
    getDecisionsForRequest,
    getCommentRelationsForRequest,
    isDecisionMade,
    mergeColumns,
    buildTableHTML,
    isUserAuthorizedForRequest
} = require('../util/helpers');
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

        // let isAuthorizedForRequest = false;
        // isUserAuthorizedForRequest(requestId, user).then(isAuth => isAuthorizedForRequest = isLabMember || isAuth)
        //     .catch(e => {
        //         console.log(`error authorizing: ${e}`);
        //     });

        const reports = [];
        const qcReportPromise = services.getQcReportSamples({
            request: requestId,
            samples: samples
        });
        const decisions = getDecisionsForRequest(requestId);
        const commentRelations = getCommentRelationsForRequest(requestId);

        Promise.all([qcReportPromise, decisions, commentRelations]).then(results => {
            if(!results) {
                return apiResponse.errorResponse(res, 'Cannot find report data');
            }
            let [qcReportResults, decisionsResults, commentRelationsResults] = results;

            console.log(`commentRelations? ${commentRelationsResults}`);
            const isAuthed = isLabMember || isUserAuthorizedForRequest(commentRelationsResults, user);
            if (!isAuthed) {
                return apiResponse.notFoundResponse(res, 'Request not found or associated with your username.');
            }

            let isCmoPmOnly = false;
            let isCmoPmOnlyAndNotPmUser = false;

            CommentRelation.findAll({
                where: {
                    request_id: requestId
                }
            }).then((commentRelationsResponse) => {
                console.log(commentRelationsResponse);
                for (let commentRelation of commentRelationsResponse) {
                    reports.push(commentRelation.report);
                    isCmoPmOnly = commentRelation.is_cmo_pm_project;
                }
                isCmoPmOnlyAndNotPmUser = isCmoPmOnly && !isCmoPm;

                let constantColumnFeatures = {};
                const tables = {};
                let readOnly = true;

                for (let field of qcReportResults) {
                    if (field === 'dnaReportSamples') {
                        if (reports.includes('DNA Report')) {
                            readOnly = isDecisionMade(qcReportResults[field]) || isCmoPmOnlyAndNotPmUser;
                            constantColumnFeatures = mergeColumns(sharedColumns, dnaColumns);
                            constantColumnFeatures.InvestigatorDecision.readOnly = readOnly;

                            tables[field] = buildTableHTML(
                                field,
                                qcReportResults[field],
                                constantColumnFeatures,
                                dnaOrder,
                                decisionsResults
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

                            tables[field] = buildTableHTML(
                                field,
                                qcReportResults[field],
                                constantColumnFeatures,
                                rnaOrder,
                                decisionsResults
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

                            tables[field] = buildTableHTML(
                                field,
                                qcReportResults[field],
                                constantColumnFeatures,
                                libraryOrder,
                                decisionsResults
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

                            tables[field] = buildTableHTML(
                                field,
                                qcReportResults[field],
                                constantColumnFeatures,
                                poolOrder,
                                decisionsResults
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
        });
    }
];
