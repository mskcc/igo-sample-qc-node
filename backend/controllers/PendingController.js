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
            console.log(responseData);

            if (userType === 'lab_member' || userType === 'project_manager') {
                buildPendingList(responseData, false);
            } else {
                buildPendingList(responseData, true);
            }

            return apiResponse.successResponse(res, responseData);
        }).catch(e => {
            console.log(e);
            res.status(500).send(`ERROR querying MySQL database: ${e}`);
        });
    }
];
