const jwt = require("jsonwebtoken");
const { users } = require("../model");
const util = require('util');

// Middleware to check if the user is authenticated
exports.isAuthenticated = async (req, res, next) => {
    const token = req.cookies.token;

    // Check if token exists
    if (!token) {
        return res.redirect("/login");
    }

    try {
        // Get the secret key from environment variables (with fallback for development)
        const secretKey = process.env.SECRET_KEY || "thisissecretkeydontshare"; // Fallback key if env variable is not set

        // Verify the token using the secret key
        const jwtVerify = util.promisify(jwt.verify);
        const verifiedResult = await jwtVerify(token, secretKey);

        // Find the user by ID from the verified token
        const user = await users.findByPk(verifiedResult.id);

        if (!user) {
            return res.redirect("/login");
        }

        // Store the user ID in the request object for later use
        req.userId = verifiedResult.id;
        next();
    } catch (error) {
        console.error("JWT Verification Error:", error);
        return res.redirect("/login");
    }
};
