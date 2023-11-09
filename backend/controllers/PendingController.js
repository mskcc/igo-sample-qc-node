const { sequelize } = require('../models');
const { Op } = require('sequelize');
const db = require('../models');
const CommentRelation = db.commentRelations;
// const Decision = db.decisions;
const apiResponse = require('../util/apiResponse');
const { buildPendingList } = require('../util/helpers');

exports.getPendingRequests = [
    function(req, res) {
        // TODO: figure out what exactly should define pending list
        const userType = req.query.userType;

        CommentRelation.findAll({
            where: {
                [Op.and]: [ 
                    sequelize.literal(`NOT EXISTS (
                                    SELECT 1 FROM decisions
                                    WHERE CommentRelation.id = decisions.comment_relation_id
                                    )`),
                ],
            },
        }).then((responseData) => {
            let pendingTable = {};
            if (userType === 'lab_member' || userType === 'project_manager') {
                pendingTable = buildPendingList(responseData, false);
            } else {
                // TODO UPDATE TO 'true' BEFORE DEPLOYMENT!!!!! userType === 'user'
                pendingTable = buildPendingList(responseData, true);
            }

            return apiResponse.successResponseWithData(res, 'success', pendingTable);
        }).catch(e => {
            console.log(e);
            return apiResponse.errorResponse(res, `ERROR querying MySQL database: ${e}`);
        });
    }
];
