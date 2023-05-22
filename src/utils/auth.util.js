const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const {
    JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET,
    JWT_ACCESS_LIFETIME,
    JWT_REFRESH_LIFETIME,
    JWT_ALL_SECRET,
} = require('../config')

exports.getTokenExpTime = (h) => {
    const number = parseInt(h.replace(/[^0-9\.]/g, ''))

    return new Date().getTime() + number * 60 * 60 * 1000
}

/**
 * FORGOT PASSWORD
 */
exports.getForgotPasswordToken = (email) =>
    jwt.sign(
        {
            email,
        },
        JWT_ALL_SECRET,
        { expiresIn: '24h' }
    )

exports.verifyForgotPasswordToken = (token) => {
    try {
        return jwt.verify(token, JWT_ALL_SECRET)
    } catch (error) {
        console.log('err verifyForgotPasswordToken :', error.message)

        return undefined
    }
}

/**
 * INVITE USER
 */
exports.getIntiveUserToPartnerToken = (
    email,
    partner_id,
    owner_user_id,
    role_ids
) =>
    jwt.sign(
        {
            email,
            partner_id,
            owner_user_id,
            role_ids,
        },
        JWT_ALL_SECRET,
        { expiresIn: '24h' }
    )

exports.verifyIntiveUserToPartnerToken = (token) => {
    try {
        return jwt.verify(token, JWT_ALL_SECRET)
    } catch (error) {
        console.log('err verifyIntiveUserToPartnerToken :', error.message)

        return undefined
    }
}

exports.getUserToken = (user_id, expiresIn, secret = JWT_ACCESS_SECRET) =>
    jwt.sign(
        {
            id: user_id,
        },
        secret,
        { expiresIn }
    )

exports.getUserAccessToken = (user_id) =>
    this.getUserToken(user_id, JWT_ACCESS_LIFETIME, JWT_ACCESS_SECRET)

exports.getUserRefreshToken = (user_id) =>
    this.getUserToken(user_id, JWT_REFRESH_LIFETIME, JWT_REFRESH_SECRET)

exports.getActiveToken = (user_id) => this.getUserToken(user_id, '12h')

exports.verifyToken = (token, secret = JWT_ACCESS_SECRET) => {
    try {
        return jwt.verify(token, secret)
    } catch (error) {
        console.log('err verifyToken :', error.message)

        return undefined
    }
}

exports.verifyAccessToken = (token) => this.verifyToken(token)
exports.verifyRefreshToken = (token) =>
    this.verifyToken(token, JWT_REFRESH_SECRET)

exports.comparePassword = async (planePw, hashedPw) =>
    bcrypt.compare(planePw, hashedPw)

exports.hashPassword = (password) => bcrypt.hash(password, 10)

exports.getUserTokenFull = (user_id) => ({
    access_token: this.getUserAccessToken(user_id),
    refresh_token: this.getUserRefreshToken(user_id),
    access_token_exp: this.getTokenExpTime(JWT_ACCESS_LIFETIME),
    refresh_token_exp: this.getTokenExpTime(JWT_REFRESH_LIFETIME),
})
