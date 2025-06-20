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
const mailer = require('../util/mailer');
const Decisions = db.decisions;
const CommentRelation = db.commentRelations;
const Comments = db.comments;
const Users = db.users;
const { syncUserFromMongo } = require('../util/userSync');
const { logger } = require('../util/winston');

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
    async function(req, res) {
        try {
            const reqData = req.body.data;
            const requestId = reqData.request;
            const samples = reqData.samples;
            const user = reqData.user;

            // Ensure user exists in MySQL
            if (user && user.username) {
                await syncUserFromMongo(user.username);
            }

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
        } catch (error) {
            console.log(error);
            return apiResponse.errorResponse(res, `Error processing request: ${error}`);
        }
    }
];

exports.savePartialSubmission = [
    async function(req, res) {
        try {
            const reqData = req.body.data;
            const decisions = reqData.decisions;
            const requestId = reqData.request_id;
            const report = reqData.report;
            const username = reqData.username;

            // Ensure user exists in MySQL
            if (username) {
                await syncUserFromMongo(username);
            }

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
        } catch (error) {
            return apiResponse.errorResponse(res, `Error processing request: ${error}`);
        }
    }
];

exports.setQCInvestigatorDecision = [
    async function(req, res) {
        try {
            const reqData = req.body.data;
            const decisions = reqData.decisions;
            const username = reqData.username;
            const fullName = reqData.userFullName;
            const requestId = reqData.request_id;
            const report = reqData.report;

            // Ensure user exists in MySQL
            if (username) {
                await syncUserFromMongo(username);
            }

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
                const qcDecisionPromise = services.setQCInvestigatorDecision(decisions);
                Promise.all([qcDecisionPromise]).then(results => {
                    //figure out what we get back from POST??
                    // console.log(results);
                    
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

                        const decisionsMade = JSON.stringify(decisions);
                        const allRecipients = commentRelationRecord.recipients.concat(`,${commentRelationRecord.author}@mskcc.org`);
                    
                        if (decisionsMade.includes('Stop processing') && report === 'Library Report') {
                        
                        const seqEmail = process.env.SEQ_EMAIL;
                        mailer.sendStopProcessingNotification(commentRelationRecord, fullName, seqEmail);
                        logger.info(`Library QC Stop Processing notification sent to SEQ team: ${seqEmail}`);
                    } else {
                        // Send regular decision notification for non-stop processing decisions
                        mailer.sendDecisionNotification(commentRelationRecord, fullName, allRecipients);
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
        } catch (error) {
            return apiResponse.errorResponse(res, `Error processing request: ${error}`);
        }
    }
];

exports.getComments = [
    query('request_id').exists().withMessage('request ID must be specified.'),
    function(req, res) {
        const requestId = req.query.request_id;
        const responseObj = {'comments': {}};

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
                for (const report in commentsResponse) {
                    commentsResponse[report]['comments'].sort((a, b) => {
                        return new Date(a.date_created) - new Date(b.date_created);
                    });
                }
                console.log("Sorted comments by date.");

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
    async function(req, res) {
        try {
            const reqData = req.body.data;
            const comment = reqData.comment;
            const reports = reqData.reports;
            const requestId = reqData.request_id;
            const recipients = reqData.recipients;
            const decisionsMade = reqData.decisions_made;
            const isCmoProject = reqData.is_cmo_pm_project;
            const username = reqData.comment.username;

            // Ensure user exists in MySQL and wait for completion
            await syncUserFromMongo(username);
            
            // Get the user (which should now exist)
            const user = await Users.findOne({
                where: { username: username }
            });
            
            if (!user) {
                return apiResponse.errorResponse(res, `User ${username} not found in database.`);
            }

            // Response object
            const commentsResponse = {};
            
            // Process each report sequentially
            for (const report of reports) {
                let relationId;
                let createdAtDate = new Date().toISOString().replace('T', ' ').replace('Z', '');
                let isDecided = false;
                let isPathologyReport = report === 'Pathology Report';
                
                // Check if relation exists
                let commentRelationRecord = await CommentRelation.findOne({
                    where: {
                        request_id: requestId,
                        report: report
                    }
                });
                
                if (!commentRelationRecord) {
                    // Create new relation
                    commentRelationRecord = await CommentRelation.create({
                        request_id: requestId,
                        report: report,
                        recipients: recipients,
                        is_cmo_pm_project: isCmoProject,
                        author: username
                    });
                    
                    relationId = commentRelationRecord.id;
                    createdAtDate = commentRelationRecord.createdAt;
                } else {
                    relationId = commentRelationRecord.id;
                }
                
                // Create comment
                const newComment = await Comments.create({
                    comment: comment.content,
                    commentrelation_id: relationId,
                    username: username
                });
                
                if (newComment) {
                    createdAtDate = newComment.createdAt;
                }
                
                // Prepare response data
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
                
                // Handle decisions
                if (report in decisionsMade) {
                    isDecided = true;
                    await Decisions.create({
                        request_id: requestId,
                        decision_maker: username,
                        comment_relation_id: relationId,
                        report: report,
                        is_submitted: true,
                        is_igo_decision: true,
                        decisions: JSON.stringify(decisionsMade[report])
                    });
                }
                
                // Send notification
                mailer.sendInitialNotification(recipients, requestId, report, user, isDecided, isPathologyReport, isCmoProject);
            }
            
            return apiResponse.successResponseWithData(res, 'Successfully saved comments and notified recipients', commentsResponse);
        } catch (error) {
            logger.error(`Error in addAndNotifyInitial: ${error}`);
            return apiResponse.errorResponse(res, `Failed to add initial comment: ${error.message || error}`);
        }
    }
];

exports.addAndNotify = [
    async function(req, res) {
        try {
            const reqData = req.body.data;
            const comment = reqData.comment.content;
            const username = reqData.comment.username;
            const report = reqData.report;
            const requestId = reqData.request_id;

            // Create response object
            const commentsResponse = {};
            commentsResponse[report] = {'comments': [], 'recipients': ''};

            // IMPORTANT: Ensure user exists BEFORE any other database operations
            // and wait for it to complete
            await syncUserFromMongo(username);
            
            // Now get the user (which should now exist)
            const user = await Users.findOne({
                where: { username: username }
            });
            
            if (!user) {
                return apiResponse.errorResponse(res, `User ${username} not found in database.`);
            }

            // Get the comment relation
            const commentRelationRecord = await CommentRelation.findOne({
                where: {
                    request_id: requestId,
                    report: report
                }
            });
            
            if (!commentRelationRecord) {
                return apiResponse.errorResponse(res, `Comment relation not found for request ${requestId} and report ${report}.`);
            }

            // Create the comment
            await Comments.create({
                comment: comment,
                commentrelation_id: commentRelationRecord.id,
                username: username
            });

            // Create response data
            const commentData = {
                'comment': comment,
                'date_created': new Date().toISOString().replace('T', ' ').replace('Z', ''),
                'username': username,
                'full_name': user.full_name,
                'title': user.title
            };
            commentsResponse[report]['recipients'] = commentRelationRecord.recipients;
            commentsResponse[report]['comments'].push(commentData);

            // Handle notifications
            let emailRecipients = commentRelationRecord.recipients;
            if (user.role !== 'lab_member') {
                const authorEmail = `${commentRelationRecord.author}@mskcc.org`;
                emailRecipients = emailRecipients.concat(',', authorEmail);
            }

            // Send notification
            mailer.sendNotification(emailRecipients, comment, requestId, report, user);

            // Return success response
            return apiResponse.successResponseWithData(res, 'Successfully saved comment and notified recipients', commentsResponse);
        } catch (error) {
            logger.error(`Error in addAndNotify: ${error}`);
            return apiResponse.errorResponse(res, `Failed to add comment: ${error.message || error}`);
        }
    }
];

exports.addToAllAndNotify = [
    async function(req, res) {
        try {
            const reqData = req.body.data;
            const comment = reqData.comment.content;
            const username = reqData.comment.username;
            const reports = reqData.reports;
            const requestId = reqData.request_id;

            // Ensure user exists in MySQL and wait for completion
            await syncUserFromMongo(username);
            
            // Get the user (which should now exist)
            const user = await Users.findOne({
                where: { username: username }
            });
            
            if (!user) {
                return apiResponse.errorResponse(res, `User ${username} not found in database.`);
            }

            // Response object
            const commentsResponse = {};
            
            // Process each report sequentially
            for (const report of reports) {
                if (typeof report === 'string' && report.toLowerCase() !== 'attachments') {
                    // Get comment relation
                    const commentRelationRecord = await CommentRelation.findOne({
                        where: {
                            request_id: requestId,
                            report: report
                        }
                    });
                    
                    if (!commentRelationRecord) {
                        logger.warn(`Comment relation not found for request ${requestId} and report ${report}.`);
                        continue;
                    }
                    
                    // Create comment
                    await Comments.create({
                        comment: comment,
                        commentrelation_id: commentRelationRecord.id,
                        username: username
                    });
                    
                    // Prepare response data
                    commentsResponse[report] = {'comments': [], 'recipients': ''};
                    const commentData = {
                        'comment': comment,
                        'date_created': new Date().toISOString().replace('T', ' ').replace('Z', ''),
                        'username': username,
                        'full_name': user.full_name,
                        'title': user.title
                    };
                    commentsResponse[report]['recipients'] = commentRelationRecord.recipients;
                    commentsResponse[report]['comments'].push(commentData);
                    
                    // Handle notifications
                    let emailRecipients = commentRelationRecord.recipients;
                    if (user.role !== 'lab_member') {
                        const authorEmail = `${commentRelationRecord.author}@mskcc.org`;
                        emailRecipients = emailRecipients.concat(',', authorEmail);
                    }
                    
                    // Send notification
                    mailer.sendNotification(emailRecipients, comment, requestId, report, user);
                }
            }
            
            return apiResponse.successResponseWithData(res, 'Successfully saved comments and notified recipients', commentsResponse);
        } catch (error) {
            logger.error(`Error in addToAllAndNotify: ${error}`);
            return apiResponse.errorResponse(res, `Failed to add comments: ${error.message || error}`);
        }
    }
];

// exports.downloadAttachment = [
//     function(req, res) {
//         const recordId = req.query.recordId;
//         const fileName = req.query.fileName;

//         const attachmentFilePromise = services.getAttachmentFile(recordId);

//         Promise.all([attachmentFilePromise]).then(result => {
//             if (!result || result.length === 0) {
//                 return apiResponse.errorResponse(res, 'Could not retreive attachment data.');
//             }

//             let [attachment] = result;
//             const docData = attachment;

//             const filePath = `${TMP_ATTACHMENT_PATH}${fileName}`;


//             glob(filePath, async(error, file) => {
//                 if (error) {
//                     console.log(error);
//                     return apiResponse.errorResponse(res, 'Could not find attachment file.');
//                 }
//                 if (!file || file.length === 0) {
//                     //create
//                     fs.writeFile(filePath, docData, 'binary', err => {
//                         if (err) {
//                             console.log(err);
//                             return apiResponse.errorResponse(res, 'There was a problem downloading attachment.');
//                         }
//                         res.set('Content-Type', 'application/pdf');
//                         const filestream = fs.createReadStream(filePath);
//                         filestream.pipe(res);
//                         // res.download(filePath);

//                         // fs.readFile(filePath, (err, data) => {
//                         //     if (err) {
//                         //         console.log(err);
//                         //         return apiResponse.errorResponse(res, 'There was a problem downloading attachment.');
//                         //     }
//                         //     // return apiResponse.successResponseWithData(res, 'Sending back PDF.', data);
//                         // });

//                     });
//                 } else {
//                     res.set('Content-Type', 'application/pdf');
//                     const filestream = fs.createReadStream(filePath);
//                     filestream.pipe(res);
//                     // res.download(filePath);


//                     // fs.readFile(filePath, (err, data) => {
//                     //     if (err) {
//                     //         console.log(err);
//                     //         return apiResponse.errorResponse(res, 'There was a problem downloading attachment.');
//                     //     }
                        
//                     //     // return apiResponse.successResponseWithData(res, 'Sending back PDF.', data);
//                     // });
//                 }

//             });
            
//         });
//     }
// ];
