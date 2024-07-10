const ErrorHandler = require('./errorHandler')
const jwt = require('jsonwebtoken')

const isAuthenticated = (req, res, next) => {

    const access_token = req.cookies.access_token

    if (!access_token) {
        return next(new ErrorHandler("Please login to access this resources", 400))
    }

    const decode = jwt.verify(access_token, process.env.ACCESS_TOKEN)

    if (!decode) {
        return next(new ErrorHandler("Access token is not valid", 400))
    }

    const user  = decode.user

    if(!user){
        return next(new ErrorHandler("User not found", 400))
    }

    req.user = user

    console.log(req.user)
    next()
}

const isAuthorized = (req, res, next) => {
    
}

module.exports = {
    isAuthenticated,
    isAuthorized
}