const { users } = require("../model")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const sendEmail = require("../services/sendEmail")

// getMethod
exports.renderRegister = (req, res) => {
    const [success] = req.flash("success")
    res.render("register", { success })
}

// postMethod
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
    const [success] = req.flash("success") // session bata nikaleko
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
    const data = await users.findOne({
        where: { email }
    })
    console.log("User fetched from database: ", data)
    
    if (!data) {
        req.flash('error2', "No user found with this email")
        return res.redirect("/login")
    } else {
        // now check password
        const hashedPassword = data.password
        const isMatch = bcrypt.compareSync(password, hashedPassword)
        if (isMatch) {
            req.session.user = {
                id: data.id,
                username: data.username,
                email: data.email
            }
            req.session.save(err => {
                if (err) console.log("Session save error:", err)
            })
            console.log("User stored in session: ", req.session.user)
            
            // generate token
            var token = jwt.sign({ id: data.id }, 'thisissecretkeydontshare', { expiresIn: "1d" })
            res.cookie("token", token)
            res.redirect("/")
        } else {
            req.flash('error', 'Invalid Email or Password') // session ma rakheko
            res.redirect("/login")
        }
    }
}

exports.logOutUser = (req, res) => {
    req.session.destroy(() => {
        res.clearCookie("token")
        res.redirect("/login")
    })
}

// getMethod
exports.forgotPassword = (req, res) => {
    const [error] = req.flash("error")
    res.render("forgotPassword", { error })
}

// postMethod
exports.handleForgotPassword = async (req, res) => {
    const { email } = req.body
    if (!email) {
        return res.send("please provide email")
    }

    const userData = await users.findOne({ where: { email } })
    if (!userData) {
        req.flash("error", "No user with that email!")
        return res.redirect("/forgotPassword")
    }

    const generatedOtp = Math.floor(10000 + Math.random() * 90000) // 5-digit OTP
    // tyo email ma OTP send garney
    const data = {
        email: email,
        subject: "OTP for password reset",
        message: "your OTP is :" + generatedOtp
    }
    await sendEmail(data)

    // OTP save garne
    userData.otp = generatedOtp
    userData.otpGeneratedTime = Date.now()
    await userData.save()

    res.redirect("/otpForm?email=" + email)
}

// getMethod
exports.renderOtpForm = (req, res) => {
    const email = req.query.email
    const [error] = req.flash("error")
    res.render("otpForm", { email, error })
}

// postMethod
exports.verifyOtp = async (req, res) => {
    const { otp } = req.body
    const email = req.params.id
    
    const user = await users.findOne({
        where: { otp: otp, email: email }
    })
    if (!user) {
        req.flash('error', 'Invalid OTP')
        return res.redirect('/otpForm?email=' + email)
    }

    const currentTime = Date.now()
    const otpGeneratedTime = user.otpGeneratedTime
    if (currentTime - otpGeneratedTime <= 120000) { // 2 minutes validity
        res.redirect(`/resetPassword?email=${email}&otp=${otp}`)
    } else {
        res.send("OTP has expired!")
    }
}

// getMethod
exports.renderResetPassword = (req, res) => {
    const { email, otp } = req.query // mathi ? bata start vaxa so req.query use garya
    if (!email || !otp) {
        return res.send("please provide email and OTP")
    }
    res.render("resetPassword", { email, otp })
}

// postMethod
exports.handleResetPassword = async (req, res) => {
    const email = req.params.email
    const otp = req.params.otp
    const { newPassword, confirmNewPassword } = req.body

    if (!email || !otp || !newPassword || !confirmNewPassword) {
        return res.send("please provide all fields")
    }
    if (newPassword !== confirmNewPassword) {
        return res.send("New password and confirm new password should be same")
    }

    const userData = await users.findOne({ where: { email, otp } })
    if (!userData) {
        return res.send("Invalid OTP or email")
    }

    const currentTime = Date.now()
    const otpGeneratedTime = userData.otpGeneratedTime
    if (currentTime - otpGeneratedTime <= 120000) {
        await users.update(
            { password: bcrypt.hashSync(newPassword, 8) },
            { where: { email } }
        )
        res.redirect("/login")
    } else {
        res.send("OTP has expired!")
    }
}
