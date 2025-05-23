const { syncUserFromMongo } = require('../util/userSync');
const { logger } = require('../util/winston');

function userSyncMiddleware(req, res, next) {
  try {
    let username = null;
    
    // Extract username from request
    if (req.body && req.body.data && req.body.data.user && req.body.data.user.username) {
      username = req.body.data.user.username;
    } 
    else if (res.user && res.user.username) {
      username = res.user.username;
    }
    else if (req.body && req.body.data && req.body.data.comment && req.body.data.comment.username) {
      username = req.body.data.comment.username;
    }
    else if (req.body && req.body.data && req.body.data.username) {
      username = req.body.data.username;
    }
    
    if (username) {
      // Run sync but don't wait for it to complete
      syncUserFromMongo(username)
        .catch(function(err) {
          logger.error('Error syncing user: ' + err);
        });
    }
    
    next();
  } catch (error) {
    logger.error('Middleware error: ' + error);
    next();
  }
}
 
module.exports = userSyncMiddleware;    