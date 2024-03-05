const db = require('../models');
const CommentRelation = db.commentRelations;
const Comments = db.comments;
const Users = db.users;
const apiResponse = require('../util/apiResponse');
const services = require('../services/services');
const { buildPendingList } = require('../util/helpers');

exports.getPendingRequests = [
    function(req, res) {
        const userType = req.params.userRole;
        const responseData = [];
        // [{request_id: '', date: '', most_recent_date: '', report: ''}]
        // MORE FIELDS FOR LAB_MEMBERS {author: '', recipients: '', lab_notifications: 0, pm_notifications: 0, user_replies: 0}

        const pendingPromise = services.getPendingRequests();

        Promise.all([pendingPromise]).then((pendingResponseData) => {
            Object.keys(pendingPromise).map(pendingRequestId => {
                CommentRelation.findOne({
                    where: {
                        request_id: pendingRequestId,
                        report: pendingResponseData[pendingRequestId]
                    }
                }).then(commentRelationRecord => {
                    return Comments.findAll({
                        where: {
                            commentrelation_id: commentRelationRecord.id
                        },
                        order: [['date_created', 'DESC']]
                    }).then(allReportComments => {
                        if (userType === 'user') {
                            responseData.push({
                                request_id: pendingRequestId,
                                report: commentRelationRecord.report,
                                date: commentRelationRecord.createdAt.toLocaleString(),
                                most_recent_date: allReportComments[0].createdAt.toLocaleString(),
                                show: `<span pending-id='${pendingRequestId}' class ='show-icon'><i class='material-icons'>forward</i></span>`
                            });
                        } else {
                            //lab_member or PM
                            let labNotifications = 0;
                            let PmNotifications = 0;
                            let userReplies = 0;
                            allReportComments.forEach(comment => {
                                Users.findOne({
                                    where: {
                                        username: comment.username
                                    }
                                }).then(user => {
                                    if (user.role === 'lab_member') {
                                        labNotifications = labNotifications + 1;
                                    } else if (user.role === 'cmo_pm') {
                                        PmNotifications = PmNotifications + 1;
                                    } else if (user.role === 'user') {
                                        userReplies = userReplies + 1;
                                    }
                                });
                            });
                            responseData.push({
                                request_id: pendingRequestId,
                                report: commentRelationRecord.report,
                                date: commentRelationRecord.createdAt.toLocaleString(),
                                most_recent_date: allReportComments[0].createdAt.toLocaleString(),
                                author: commentRelationRecord.author,
                                recipients: commentRelationRecord.recipients,
                                lab_notifications: labNotifications,
                                pm_notifications: PmNotifications,
                                user_replies: userReplies,
                                show: `<span pending-id='${pendingRequestId}' class ='show-icon'><i class='material-icons'>forward</i></span>`
                            });
                        }
                        
                        let pendingTable = {};
                        if (userType === 'lab_member' || userType === 'cmo_pm') {
                            pendingTable = buildPendingList(responseData, false);
                        } else {
                            // userType === 'user'
                            pendingTable = buildPendingList(responseData, true);
                        }

                        return apiResponse.successResponseWithData(res, 'success', pendingTable);

                    });
                }).catch(e => {
                    console.log(e);
                    return apiResponse.errorResponse(res, `ERROR querying MySQL database: ${e}`);
                });;
            });
            
        }).catch(e => {
            console.log(e);
            return apiResponse.errorResponse(res, `ERROR querying LIMS: ${e}`);
        });
    }
];
