const { renderRegister, registerUser, renderLogin, loginUser, logOutUser, forgotPassword, handleForgotPassword, renderOtpForm, verifyOtp, renderResetPassword, handleResetPassword } = require("../controller/authController")
const catchError = require("../services/catchError")

const router = require("express").Router()

router.route("/register").get(catchError(renderRegister)).post(catchError(registerUser))
router.route("/login").get(catchError(renderLogin)).post(catchError(async (req, res, next) => {
    try {
        await loginUser(req, res, next); // Call login function
        if (req.user) { // Ensure req.user exists after login
            req.session.user = { id: req.user.id, email: req.user.email }; // Store user session
            req.session.save(err => {
                if (err) console.log("Session save error:", err);
            });
        }
    } catch (err) {
        next(err);
    }
}));
router.route("/logout").get(catchError(logOutUser))
router.route("/forgotPassword").get(catchError(forgotPassword)).post(catchError(handleForgotPassword))
router.route("/otpForm").get(catchError(renderOtpForm))
router.route("/verifyOtp/:id").post(catchError(verifyOtp))
router.route("/resetPassword").get(catchError(renderResetPassword))
router.route("/resetPassword/:email/:otp").post(catchError(handleResetPassword))

module.exports = router
