


const jwt = require("jsonwebtoken")
// const promisify = require("util")
const { users } = require("../model")

exports.isAuthenticated = async(req, res, next) => {
    const token = req.cookies.token
    console.log(token);
    

    if(!token || token === null || token === undefined) {
        return res.redirect("/login")
    }
    // if token aayo vney, verify garney
    // const verifiedResult = await promisify (jwt.verify)(token, process.env.SECRET_KEY)
    const util = require('util')
const jwtVerify = util.promisify(jwt.verify)
const verifiedResult = await jwtVerify(token, process.env.SECRET_KEY)

    const user = await users.findByPk(verifiedResult.id)

    if(!user){
        return res.redirect("/login")
    }
    req.userId = verifiedResult.id
    next()  
}
