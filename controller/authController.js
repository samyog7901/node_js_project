const { users } = require("../model")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const sendEmail = require("../services/sendEmail")
const { query } = require("express")

exports.renderRegister = (req, res) => {
    const [success] = req.flash("success")
    res.render("register", { success })
}

exports.registerUser = async (req, res) => {
    const { username, email, password } = req.body
    await users.create({
        username,
        email,
        password: bcrypt.hashSync(password, 10)
    })
    req.flash('success', 'User created successfully!')
    res.redirect("/login")
}

// getMethod
exports.renderLogin = (req, res) => {
    const [error] = req.flash("error") // session bata nikaleko
    const [success] = req.flash("success") // Fix: Retrieve success message
    const [error2] = req.flash("error2") // session bata nikaleko
    res.render("login", { error, success, error2 })
}

// postMethod
exports.loginUser = async (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        return res.send("please provide email and password")
    }
    // check whether that email exist or not in users table
    const data = await users.findAll({
        where: {
            email: email
        }
    })
    console.log("User fetched from database: ", data)
    
    if (data.length == 0) {
        req.flash('error2', "No user found with this email")
        return res.redirect("/login")
    } else {
        // now check password
        const hashedPassword = data[0].password
        const isMatch = bcrypt.compareSync(password, hashedPassword)
        if (isMatch) {
            req.session.data = {
                id: data[0].id,
                username: data[0].username,
                email: data[0].email
            }
            console.log("user stored in session: ", req.session.user)
            
            // generate token
            var token = jwt.sign({ id: data[0].id }, process.env.SECRET_KEY, { expiresIn: "1d" })
            res.cookie("token", token)
            res.redirect("/")
        } else {
            req.flash('error', 'Invalid Email or Password') // session ma rakheko
            res.redirect("/login")
            return
        }
    }
}

exports.logOutUser = (req, res) => {
    req.session.destroy(()=>{
        res.clearCookie("token")
        res.redirect("/login")
    })
}

exports.forgotPassword = (req, res) => {
    const [error] = req.flash("error")
    res.render("forgotPassword",{error})
}

exports.handleForgotPassword = async (req, res) => {
    const { email } = req.body
    if (!email) {
        return res.send("please provide email")
    }
    const userData = await users.findAll({
        where: {
            email
        }
    })
    if (userData.length == 0) {
        req.flash("error", "No user with that email!")
        res.redirect("/forgotPassword")
        return
    }
    const generatedOtp = Math.floor(Math.floor(10000 * Math.random(99999)))
    // tyo email ma OTP send garney
    const data = {
        email: email,
        subject: "OTP for password reset",
        message: "your OTP is :" + generatedOtp
    }
    await sendEmail(data)
    // OTP save garne
    userData[0].otp = generatedOtp
    userData[0].otpGeneratedTime = Date.now()
    await userData[0].save()
    res.redirect("/otpForm?email=" + email)
}

exports.renderOtpForm = (req, res) => {
    const email = req.query.email
    const [error] = req.flash("error")
    res.render("otpForm", { email, error })
}

exports.verifyOtp = async (req, res) => {
    const { otp } = req.body
    const email = req.params.id
    
    const data = await users.findAll({
        where: {
            otp: otp,
            email: email
        }
    })
    if (data.length == 0) {
        req.flash('error', 'Invalid OTP')
        res.redirect('/otpForm?email=' + email)
        return
    }
    const currentTime = Date.now()
    const otpGeneratedTime = data[0].otpGeneratedTime
    if (currentTime - otpGeneratedTime <= 120000) {
        res.redirect(`/resetPassword?email=${email}&otp=${otp}`)
    } else {
        res.send("OTP has expired!")
    }
}

exports.renderResetPassword = (req, res) => {
    const { email, otp } = req.query // mathi ? bata start vaxa so req.query use garya
    if (!email || !otp) {
        return res.send("please provide email and OTP")
    }
    res.render("resetPassword", { email, otp })
}

exports.handleResetPassword = async (req, res) => {
    const email = req.params.email
    const otp = req.params.otp
    const { newPassword, confirmNewPassword } = req.body

    if (!email || !otp || !newPassword || !confirmNewPassword) {
        return res.send("please provide all fields")
    }
    if (newPassword != confirmNewPassword) {
        return res.send("New password and confirm new password should be same")
    }
    const userData = await users.findAll({
        where: {
            email,
            otp
        }
    })
    const currentTime = Date.now()
    const otpGeneratedTime = userData[0].otpGeneratedTime
    if (currentTime - otpGeneratedTime <= 120000) {
        await users.update({
            password: bcrypt.hashSync(newPassword, 8)
        },
        {
            where: {
                email: email
            }
        })
        res.redirect("/login")
    } else {
        res.send("OTP has expired!")
    }
}
