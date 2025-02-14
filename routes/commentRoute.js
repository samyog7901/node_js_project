const {addComment} = require("../controller/blogController")
const { isAuthenticated } = require("../middleware/isAuthenticated")
const catchError = require("../services/catchError")

const router = require("express").Router()

router.route("/comment").post(isAuthenticated,catchError(addComment))

module.exports = router  //export the router to use in other files