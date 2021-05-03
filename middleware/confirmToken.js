const jwt = require('jsonwebtoken');
const { errorResponse } = require('../auxiliary/auxiliary');

exports.confirmToken = async (req, res, next) => {

    try {
        const { authorization } = req.headers;
        
        if (!authorization) {
            return errorResponse(res, 401, 'You need authorization to access this information');
        }

        jwt.verify(authorization, process.env.JWT_SECRET_CODE, (err, payload) => {
            if (err) {
                return errorResponse(res, 400, 'Invalid token');
            }
            // check expiration time
            if (Math.floor(Date.now() / 1000) > payload.exp) {
                return errorResponse(res, 419, 'Your token has expired, please login again.');
            }

            req.user = {
                id: payload.user_id,
                username: payload.username
            }
            next();
        });
        
        
        

    } catch (error) {
        console.log(error);
        return errorResponse(res, 500, 'Server Error.');
    }

    
    
}