const jwt = require('jsonwebtoken');

const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE || '800', 10);
const refreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRE || '604800', 10);

const accessTokenOptions = {
    expires: new Date(Date.now() + accessTokenExpire * 1000),
    maxAge: accessTokenExpire * 1000,
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
};

const refreshTokenOptions = {
    expires: new Date(Date.now() + refreshTokenExpire * 1000),
    maxAge: refreshTokenExpire * 1000,
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
};

const generateUserSignedInAccessToken = (user) => {
    const token = jwt.sign({ user: user }, process.env.ACCESS_TOKEN, { expiresIn: accessTokenExpire });
    return token;
};

const generateUserSignedInRefreshToken = (user) => {
    const token = jwt.sign({ user: user }, process.env.REFRESH_TOKEN, { expiresIn: refreshTokenExpire });
    return token;
};

const sendToken = (user, statusCode, req, res) => {
    const accessToken = generateUserSignedInAccessToken(user);
    const refreshToken = generateUserSignedInRefreshToken(user);

    console.log('Access ==> ', accessToken)
    console.log('Refresh Token ==> ', refreshToken)

    if (process.env.NODE_ENV === 'production') {
        accessTokenOptions.secure = true;
    }

    res.cookie('access_token', accessToken, accessTokenOptions);
    res.cookie('refresh_token', refreshToken, refreshTokenOptions);


    res.status(statusCode).json({
        success: true,
        user,
        accessToken
    });
};

module.exports = {
    accessTokenExpire,
    refreshTokenExpire,
    accessTokenOptions,
    refreshTokenOptions,
    generateUserSignedInAccessToken,
    generateUserSignedInRefreshToken,
    sendToken
};