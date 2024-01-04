const services = require('../services/services');
const apiResponse = require('../util/apiResponse');
const { query } = require('express-validator');
// const PDFDocument = require('pdfkit');
// const blobStream = require('blob-stream');
// const Buffer = require('buffer');
// const Blob = require('cross-blob');
const fs = require('fs');
const glob = require('glob');
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
const mailer = require('../util/mailer');
const Decisions = db.decisions;
const CommentRelation = db.commentRelations;
const Comments = db.comments;
const Users = db.users;

const TMP_ATTACHMENT_PATH = process.env.TMP_FOLDER;


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
                            decisionsSamplesByReport[resultReport] = decisionSamples;
                        });
                    }
                    for (let field of Object.keys(qcReportResults)) {
                        if (field === 'dnaReportSamples') {
                            if ((reports.includes('DNA Report') && isAuthed) || isLabMember) {
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
                            if ((reports.includes('RNA Report') && isAuthed) || isLabMember) {
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
                            if ((reports.includes('Library Report') && isAuthed) || isLabMember) {
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
                            if ((reports.includes('Pool Report') && isAuthed) || isLabMember) {
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
                            if ((reports.includes('Pathology Report') && isAuthed) || isLabMember) {

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

exports.setQCInvestigatorDecision = [
    function(req, res) {
        const reqData = req.body.data;
        const decisions = reqData.decisions;
        const username = reqData.username;
        const requestId = reqData.request_id;
        const report = reqData.report;

        CommentRelation.findOne({
            where: {
                request_id: requestId,
                report: report
            }
        }).then(commentRelationRecord => {
            if (!commentRelationRecord || commentRelationRecord.length === 0) {
                return apiResponse.errorResponse(res, 'Can only decide on reports with initial comment.');
            }

            // save to LIMS
            const saveQcDecisionPromise = services.setQCInvestigatorDecision(decisions);
            Promise.all([saveQcDecisionPromise]).then(results => {
                //figure out what we get back from POST??
                console.log(results);

                // save/update Decisions table
                Decisions.findOne({
                    where: {
                        comment_relation_id: commentRelationRecord.id
                    }
                }).then(decision => {
                    if (!decision || decision.length === 0) {
                        Decisions.create({
                            decisions: JSON.stringify(decisions),
                            report: report,
                            request_id: requestId,
                            is_submitted: true,
                            decision_maker: username,
                            comment_relation_id: commentRelationRecord.id
                        });
                    } else {
                        Decisions.update({
                            decisions: JSON.stringify(decisions),
                            is_submitted: true,
                            decision_maker: username,
                        }, {
                            where: {
                                comment_relation_id: commentRelationRecord.id
                            }
                        });
                    }
                }).catch(error => {
                    return apiResponse.errorResponse(res, `Failed to save decision to database. Please contact an admin by emailing zzPDL_SKI_IGO_DATA@mskcc.org. ${error}`);
                });

                return apiResponse.successResponse(res, 'Decisions submitted to IGO.');

            }).catch(error => {
                return apiResponse.errorResponse(res, `Failed to save decisions to LIMS. Please contact an admin by emailing zzPDL_SKI_IGO_DATA@mskcc.org. ${error}`);
            });

        }).catch(error => {
            return apiResponse.errorResponse(res, `Failed to save submit. Please contact an admin by emailing zzPDL_SKI_IGO_DATA@mskcc.org. ${error}`);
        });
    }
];

exports.getComments = [
    query('request_id').exists().withMessage('request ID must be specified.'),
    function(req, res) {
        const requestId = req.query.request_id;
        const responseObj = {'comments': null};

        CommentRelation.findAll({
            where: {
                request_id: requestId
            }
        }).then(commentRelationRecords => {
            if (!commentRelationRecords || commentRelationRecords.length === 0) {
                return apiResponse.successResponseWithData(res, 'No comments for request', responseObj);
            }
            // response should look like: 
            
            const commentsResponse = {
                'DNA Report': {'comments': [], 'recipients': ''},
                'RNA Report': {'comments': [], 'recipients': ''},
                'Pool Report': {'comments': [], 'recipients': ''},
                'Library Report': {'comments': [], 'recipients': ''},
                'Pathology Report': {'comments': [], 'recipients': ''}
            };

            
            return Promise.all(commentRelationRecords.map(commentRelation => {
                commentsResponse[commentRelation.report]['recipients'] = commentRelation.recipients;

                return Comments.findAll({
                    where: {
                        commentrelation_id: commentRelation.id
                    },
                    order: [['date_created', 'ASC']]
                }).then(commentsRecords => {
                    // commentsRecords.forEach(comment => {
                    return Promise.all(commentsRecords.map(comment => {
                        return Users.findOne({
                            where: {
                                username: comment.username
                            }
                        }).then(user => {

                            const commentData = {
                                'comment': comment.comment,
                                'date_created': comment.createdAt,
                                'username': comment.username,
                                'full_name': user.full_name,
                                'title': user.title
                            };
                            commentsResponse[commentRelation.report]['comments'].push(commentData);
                        });
                        
                        
                    }));
                     
                }).catch(error => {
                    return apiResponse.errorResponse(res, `Failed to retrieve comments from database. Please contact an admin by emailing zzPDL_SKI_IGO_DATA@mskcc.org. ${error}`);
                });
            })).then(() => {
                // delete reports without comments
                for (const report in commentsResponse) {
                    if (commentsResponse[report]['comments'].length === 0) {
                        delete commentsResponse[report];
                    }
                }
                const response = {'comments': commentsResponse};
                return apiResponse.successResponseWithData(res, 'Successfully retrieved comments', response); 
            });

        }).catch(error => {
            return apiResponse.errorResponse(res, `Failed to retrieve commentRelations from database. Please contact an admin by emailing zzPDL_SKI_IGO_DATA@mskcc.org. ${error}`);
        });
    }
];

exports.addAndNotifyInitial = [
    function(req, res) {
        const reqData = req.body.data;
        const comment = reqData.comment;
        const reports = reqData.reports;
        const requestId = reqData.request_id;
        const recipients = reqData.recipients;
        const decisionsMade = reqData.decisions_made;
        const isCmoProject = reqData.is_cmo_pm_project;
        const username = reqData.comment.username;

        //return value for comment state
        const commentsResponse = {};
        // const commentsResponse = {
        //     'DNA Report': {'comments': [], 'recipients': ''},
        //     'RNA Report': {'comments': [], 'recipients': ''},
        //     'Pool Report': {'comments': [], 'recipients': ''},
        //     'Library Report': {'comments': [], 'recipients': ''},
        //     'Pathology Report': {'comments': [], 'recipients': ''}
        // };

        Users.findOne({
            where: {
                username: username
            }
        }).then(user => {
            Promise.all(reports.map(report => {
                let isDecided = false;
                let isPathologyReport = report === 'Pathology Report';
                return CommentRelation.findOne({
                    where: {
                        request_id: requestId,
                        report: report
                    }
                }).then(commentRelationRecord => {
                    let relationId;
                    let createdAtDate = new Date().toISOString().replace('T', ' ').replace('Z', '');
                    if (!commentRelationRecord || commentRelationRecord.length === 0) {
                        CommentRelation.create({
                            request_id: requestId,
                            report: report,
                            recipients: recipients,
                            is_cmo_pm_project: isCmoProject,
                            author: username
                        }).then(relation => {
                            relationId = relation.id;
                            createdAtDate = relation.createdAt;
                            Comments.create({
                                comment: comment.content,
                                commentrelation_id: relation.id,
                                username: username
                            });
                        });

                        
                        
                    } else {
                        relationId = commentRelationRecord.id;
                        Comments.create({
                            comment: comment.content,
                            commentrelation_id: commentRelationRecord.id,
                            username: username
                        }).then(comment => {
                            createdAtDate = comment.createdAt;
                        });
                    }

                    // create commentData for response
                    commentsResponse[report] = {'comments': [], 'recipients': ''};
                    const commentData = {
                        'comment': comment.content,
                        'date_created': createdAtDate,
                        'username': username,
                        'full_name': user.full_name,
                        'title': user.title
                    };
                    commentsResponse[report]['recipients'] = recipients;
                    commentsResponse[report]['comments'].push(commentData);


                    // an inital comment was submitted for a report where all decisions have been made in the LIMS already
                    if (report in decisionsMade) {
                        isDecided = true;
                        Decisions.create({
                            request_id: requestId,
                            decision_maker: username,
                            comment_relation_id: relationId,
                            report: report,
                            is_submitted: true,
                            is_igo_decision: true,
                            decisions: JSON.stringify(decisionsMade[report])
                        });
                    }

                    mailer.sendInitialNotification(recipients, requestId, report, user, isDecided, isPathologyReport, isCmoProject);

                }).catch(error => {
                    return apiResponse.errorResponse(res, `Failed to save comment to database. Please contact an admin by emailing zzPDL_SKI_IGO_DATA@mskcc.org. ${error}`);
                });
            })).then(() => {
                return apiResponse.successResponseWithData(res, 'Successfully saved comments and notified recipients', commentsResponse);
            });

        }).catch(error => {
            return apiResponse.errorResponse(res, `Failed to save user comment to database. Please contact an admin by emailing zzPDL_SKI_IGO_DATA@mskcc.org. ${error}`);
        });
        
        
    }
];

exports.addAndNotify = [
    function(req, res) {
        const reqData = req.body.data;
        const comment = reqData.comment.content;
        const username = reqData.comment.username;
        const report = reqData.report;
        const requestId = reqData.request_id;

        //return value for comment state
        const commentsResponse = {};
        commentsResponse[report] = {'comments': [], 'recipients': ''};

        Users.findOne({
            where: {
                username: username
            }
        }).then(user => {
            CommentRelation.findOne({
                where: {
                    request_id: requestId,
                    report: report
                }
            }).then(commentRelationRecord => {
                Comments.create({
                    comment: comment,
                    commentrelation_id: commentRelationRecord.id,
                    username: username
                });
                const commentData = {
                    'comment': comment,
                    'date_created': new Date().toISOString().replace('T', ' ').replace('Z', ''),
                    'username': username,
                    'full_name': user.full_name,
                    'title': user.title
                };
                commentsResponse[report]['recipients'] = commentRelationRecord.recipients;
                commentsResponse[report]['comments'].push(commentData);

                // if a non-lab member comments, notify intial comment's author
                let emailRecipients = commentRelationRecord.recipients;
                if (user.role !== 'lab_member') {
                    const authorEmail = `${commentRelationRecord.author}@mskcc.org`;
                    emailRecipients = emailRecipients.concat(',', authorEmail);
                }

                mailer.sendNotification(emailRecipients, comment, requestId, report, user);

                return apiResponse.successResponseWithData(res, 'Successfully saved comment and notified recipients', commentsResponse);

            }).catch(error => {
                return apiResponse.errorResponse(res, `Failed to save user comment to database. Please contact an admin by emailing zzPDL_SKI_IGO_DATA@mskcc.org. ${error}`);
            });
        }).catch(error => {
            return apiResponse.errorResponse(res, `Failed to get user from database. Please contact an admin by emailing zzPDL_SKI_IGO_DATA@mskcc.org. ${error}`);
        });
    }
];

exports.addToAllAndNotify = [
    function(req, res) {
        const reqData = req.body.data;
        const comment = reqData.comment.content;
        const username = reqData.comment.username;
        const reports = reqData.reports;
        const requestId = reqData.request_id;

        // return value for comment state:
        const commentsResponse = {};
        // const commentsResponse = {
        //     'DNA Report': {'comments': [], 'recipients': ''},
        //     'RNA Report': {'comments': [], 'recipients': ''},
        //     'Pool Report': {'comments': [], 'recipients': ''},
        //     'Library Report': {'comments': [], 'recipients': ''},
        //     'Pathology Report': {'comments': [], 'recipients': ''}
        // };
        Users.findOne({
            where: {
                username: username
            }
        }).then(user => {
            Promise.all(reports.map(report => {
                if (report.toLowerCase() !== 'attachments') {
                    commentsResponse[report] = {'comments': [], 'recipients': ''};

                    return CommentRelation.findOne({
                        where: {
                            request_id: requestId,
                            report: report
                        }
                    }).then(commentRelationRecord => {
                        
                        Comments.create({
                            comment: comment,
                            commentrelation_id: commentRelationRecord.id,
                            username: username
                        });
                    
                        const commentData = {
                            'comment': comment,
                            'date_created': new Date().toISOString().replace('T', ' ').replace('Z', ''),
                            'username': username,
                            'full_name': user.full_name,
                            'title': user.title
                        };

                        commentsResponse[report]['recipients'] = commentRelationRecord.recipients;
                        commentsResponse[report]['comments'].push(commentData);

                        // if a non-lab member comments, notify intial comment's author
                        let emailRecipients = commentRelationRecord.recipients;
                        if (user.role !== 'lab_member') {
                            const authorEmail = `${commentRelationRecord.author}@mskcc.org`;
                            emailRecipients = emailRecipients.concat(',', authorEmail);
                        }

                        mailer.sendNotification(emailRecipients, comment, requestId, report, user);


                    }).catch(error => {
                        return apiResponse.errorResponse(res, `Failed to save user comment to database. Please contact an admin by emailing zzPDL_SKI_IGO_DATA@mskcc.org. ${error}`);
                    });
                }
            })).then(() => {
                return apiResponse.successResponseWithData(res, 'Successfully saved comments and notified recipients', commentsResponse);
            });
        }).catch(error => {
            return apiResponse.errorResponse(res, `Failed to get user from database. Please contact an admin by emailing zzPDL_SKI_IGO_DATA@mskcc.org. ${error}`);
        });
    }
];

exports.downloadAttachment = [
    function(req, res) {
        const recordId = req.query.recordId;
        // const fileName = req.query.fileName;

        const attachmentFilePromise = services.getAttachmentFile(recordId);

        Promise.all([attachmentFilePromise]).then(result => {
            if (!result || result.length === 0) {
                return apiResponse.errorResponse(res, 'Could not retreive attachment data.');
            }

            let [attachment] = result;
            const docData = attachment;

            return res.status(200).blob(docData);

            // const filePath = `${TMP_ATTACHMENT_PATH}${fileName}`;

            // glob(filePath, async(error, file) => {
            //     if (error) {
            //         console.log(error);
            //         return apiResponse.errorResponse(res, 'Could not find attachment file.');
            //     }
            //     if (!file || file.length === 0) {
            //         //create
            //         fs.writeFile(filePath, docData, {}, err => {
            //             if (err) {
            //                 console.log(err);
            //                 return apiResponse.errorResponse(res, 'There was a problem downloading attachment.');

            //             }
                        
            //             return apiResponse.successResponseWithData(res, 'Sending back PDF.', file);

            //         });
            //     } else {
            //         return apiResponse.successResponseWithData(res, 'Sending back PDF.', file);
            //     }

            // });
            


            // const blob = new Buffer.Blob([docData]);
            // return apiResponse.successResponseWithData(res, 'Sending back PDF.', docData);


            // const file = fs.createReadStream(docData)

            // const blob = new Blob([docData]);
            // return apiResponse.successResponseWithData(res, 'Sending back PDF.', blob);



            // const doc = new PDFDocument;
            // const fileType = 'application/pdf';
            // const fileExtension = '.pdf';

            // const stream = doc.pipe(blobStream());
            // doc.pipe(res);
            // doc.addContent(docData);
            // doc.write(docData);
            // doc.end();

            // res.writeHead(200, {
            //     'Content-Type': fileType
            // });
            // stream.on('finish', function() {
            //     const blob = stream.toBlob('application/pdf');
            //     return apiResponse.successResponseWithData(res, 'Sending back PDF.', blob);

            //     //FileSaver.saveAs(blob, fileName + fileExtension);
            // });
        });
    }
];
