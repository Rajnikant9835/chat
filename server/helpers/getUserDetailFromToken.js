const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');
const getUserDetailFromToken = async (token) => {
    if (!token) {
        return {
            message: "session out",
            logout: true
        }
    }

    const decode = await jwt.verify(token, process.env.JWT_SECREAT_KEY);

    const user = await UserModel.findById(decode.id).select('-password') //select for removing here use for remove the password

    return user;
}

module.exports = getUserDetailFromToken