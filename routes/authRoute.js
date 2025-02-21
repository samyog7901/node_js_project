const express = require("express")
const catchError = require("../services/catchError")
const {
    renderRegister,
    registerUser,
    renderLogin,
    loginUser,
    logOutUser,
    forgotPassword,
    handleForgotPassword,
    renderOtpForm,
    verifyOtp,
    renderResetPassword,
    handleResetPassword
} = require("../controller/authController")

const router = express.Router()

// Register Route
router.get("/register", renderRegister)
router.post("/register", catchError(registerUser))

// Login Route
router.get("/login", renderLogin)
router.post("/login", catchError(async (req, res, next) => {
    await loginUser(req, res, next) // Call login function
        if (req.user) { // Ensure req.user exists after login
            req.session.user = { id: req.user.id, email: req.user.email };
            req.session.save(err => {
                if (err) {
                    console.error("Session save error:", err);
                } else {
                    console.log("User stored in session:", req.session.user);
                }
            });
        }
        
}))

// Logout Route
router.get("/logout", catchError(logOutUser))

// Forgot Password Routes
router.get("/forgotPassword", forgotPassword)
router.post("/forgotPassword", catchError(handleForgotPassword))

// OTP Verification Routes
router.get("/otpForm", renderOtpForm)
router.post("/verifyOtp/:id", catchError(verifyOtp))

// Reset Password Routes
router.get("/resetPassword", renderResetPassword)
router.post("/resetPassword/:email/:otp", catchError(handleResetPassword))

module.exports = router
