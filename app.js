require('dotenv').config() // ma dotenv use gariraxu sabai reqd config set garde vane
const express = require('express') // express lai node_module bata nikalera express vanne vadama rakhe
const { blogs, sequelize, users } = require('./model/index')
// const multer = require('./middleware/multerConfig').multer
// const storage = require('./middleware/multerConfig').storage

const app = express()
const CookieParser = require('cookie-parser')
const blogRoute = require("./routes/blogRoute")
const authRoute = require("./routes/authRoute")
const commentRoute = require("./routes/commentRoute")
const sendSMS = require('./services/sendSMS')
const session = require('express-session')
const flash = require('connect-flash')
const util = require('util')
const jwt = require("jsonwebtoken")

// ✅ Session middleware set before accessing req.session
app.use(session({
    secret: 'radhethisissecret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
}))

app.use(flash())

app.use((req, res, next) => {
    console.log("Session object at middleware:", req.session); // ✅ Debugging session

    res.locals.user = req.session.user || null // ✅ Changed from req.session.data to req.session.user
    next()
})

// app.use(express.json()) // yo chai primary arch.ko lagi 
app.use(CookieParser())
app.use(express.urlencoded({ extended: true })) // req.body ma data pani paryo(yo monolithic arch lai)
app.set('view engine', 'ejs') // expresslai maile ejs use garna laako yesko laagi required sabai environments(configuration) set garde vaneko 

app.use(async (req, res, next) => {
    // const currentUser = req.user
    res.locals.currentUser = req.cookies.token

    if (req.cookies.token) {
        try {
            const jwtVerify = util.promisify(jwt.verify)
            const data = await jwtVerify(req.cookies.token, process.env.SECRET_KEY)
            res.locals.currentUserId = data.id
        } catch (error) {
            console.log("JWT Verification Error:", error);
            res.locals.currentUserId = null
        }
    } else {
        res.locals.currentUserId = null
    }
    next()
})

require("./model/index") // Database connection
// http://localhost:3000 + /create
app.use('/', blogRoute) // Route linked(means route concatenation)
app.use('/', authRoute)
app.use('/', commentRoute)

app.use(express.static('public/css/')) // given access to content of public/css folder
app.use(express.static('./storage/'))

// sendSMS()

app.listen(4000, () => {
    console.log("Prem se Bolo Radhe Radhe!")
})
