const db = require('../models');
const CommentRelation = db.commentRelations;
// const Decision = db.decisions;
const apiResponse = require('../util/apiResponse');

exports.getPendingRequests = [
    function(req, res) {
        // TODO: figure out what exactly should define pending list
        
        CommentRelation.findAll().then((responseData) => {
            console.log(responseData);
            res.status(200).send(responseData);
            return apiResponse.successResponse(res, responseData);
        }).catch(e => {
            console.log(e);
            res.status(500).send(`ERROR querying MySQL database: ${e}`);
        });
    }
];
