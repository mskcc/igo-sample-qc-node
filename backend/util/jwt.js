// util/jwt.js
const jwtInCookie = require('jwt-in-cookie');
const apiResponse = require('./apiResponse');
const { syncUserFromMongo } = require('./userSync');

exports.authenticate = function (req, res, next) {
    try {
        let user = jwtInCookie.validateJwtToken(req);
        user.role = determineRole(user);
        res.user = user;
        
        // Sync user to MySQL in the background
        if (user && user.username) {
            syncUserFromMongo(user.username)
                .catch(err => {
                    console.error(`Error syncing user ${user.username} to MySQL:`, err);
                });
        }
    } catch (err) {
        return apiResponse.unauthorizedResponse(res, 'Invalid session');
    }
    next();
};

const determineRole = (user) => {
    if (user.isLabMember) {
        return 'lab_member';
    }
    if (user.isPM) {
        return 'cmo_pm';
    }
    if (user.isUser) {
        return 'user';
    }
};