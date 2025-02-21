// Global Error handler function
const catchError = (fn) => {
    return (req, res, next) => {
        if (typeof fn !== 'function') {
            console.error("❌ Error: Passed argument is not a function", fn);
            return next(new Error("Invalid route handler"));
        }

        console.log("🛠️ Function Type Check:", typeof fn);
        console.log("🛠️ Function Source:", fn.toString());

        Promise.resolve(fn(req, res, next)).catch((err) => {
            console.error("🔥 Caught Error:", err.message);
            next(err); // Pass to the global error handler
        });
    };
};

module.exports = catchError;
