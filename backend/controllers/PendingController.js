const db = require('../models');
const CommentRelation = db.commentRelations;
const Comments = db.comments;
const Users = db.users;
const apiResponse = require('../util/apiResponse');
const services = require('../services/services');
const { buildPendingList } = require('../util/helpers');

exports.getPendingRequests = [
    function(req, res) {
        console.log(res.user);
        const userType = req.params.userRole;
        const responseData = [];
        
        const pendingPromise = services.getPendingRequests();

        Promise.all([pendingPromise]).then((pendingResponse) => {
            if (!pendingResponse || pendingResponse.length === 0) {
                return apiResponse.errorResponse(res, 'No pending request data available.');
            }
            
            const [pendingRequests] = pendingResponse;
            Object.keys(pendingRequests).forEach(pendingRequestId => {
                // console.log(pendingResponseData[pendingRequestId]);
                CommentRelation.findOne({
                    where: {
                        request_id: pendingRequestId,
                        report: pendingRequests[pendingRequestId]
                    }
                }).then(commentRelationRecord => {
                    if (commentRelationRecord && commentRelationRecord.length > 0) {
                        // return Comments.findAll({
                        //     where: {
                        //         commentrelation_id: commentRelationRecord.id
                        //     },
                        //     order: [['date_created', 'DESC']]
                        // }).then(allReportComments => {
                            if (userType === 'user') {
                                responseData.push({
                                    request_id: pendingRequestId,
                                    report: commentRelationRecord.report,
                                    date: commentRelationRecord.createdAt.toLocaleString(),
                                    // most_recent_date: allReportComments[0].createdAt.toLocaleString(),
                                    show: `<span pending-id='${pendingRequestId}' class ='show-icon'><i class='material-icons'>forward</i></span>`
                                });
                            } else {
                                //lab_member or PM

                                // let labNotifications = 0;
                                // let PmNotifications = 0;
                                // let userReplies = 0;
                                // allReportComments.forEach(comment => {
                                //     Users.findOne({
                                //         where: {
                                //             username: comment.username
                                //         }
                                //     }).then(user => {
                                //         if (user.role === 'lab_member') {
                                //             labNotifications = labNotifications + 1;
                                //         } else if (user.role === 'cmo_pm') {
                                //             PmNotifications = PmNotifications + 1;
                                //         } else if (user.role === 'user') {
                                //             userReplies = userReplies + 1;
                                //         }
                                //     });
                                // });
                                responseData.push({
                                    request_id: pendingRequestId,
                                    report: commentRelationRecord.report,
                                    date: commentRelationRecord.createdAt.toLocaleString(),
                                    // most_recent_date: allReportComments[0].createdAt.toLocaleString(),
                                    author: commentRelationRecord.author,
                                    recipients: commentRelationRecord.recipients,
                                    // lab_notifications: labNotifications,
                                    // pm_notifications: PmNotifications,
                                    // user_replies: userReplies,
                                    show: `<span pending-id='${pendingRequestId}' class ='show-icon'><i class='material-icons'>forward</i></span>`
                                });
                            }
                    }
                }).catch(e => {
                    console.log(e);
                    return apiResponse.errorResponse(res, `ERROR querying MySQL database: ${e}`);
                });
            
            });

            let pendingTable = {};
            if (userType === 'lab_member' || userType === 'cmo_pm') {
                pendingTable = buildPendingList(responseData, false);
            } else {
                // userType === 'user'
                pendingTable = buildPendingList(responseData, true);
            }

            return apiResponse.successResponseWithData(res, 'success', pendingTable);


        }).catch(e => {
            console.log(e);
            return apiResponse.errorResponse(res, `ERROR querying LIMS: ${e}`);
        });

    }
];
