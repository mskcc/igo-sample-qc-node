const jwtInCookie = require('jwt-in-cookie');

const apiResponse = require('../util/apiResponse');
exports.authenticate = function (req, res, next) {
    try {
        let user = jwtInCookie.validateJwtToken(req);
        user.role = determineRole(user);
        res.user = user;
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
