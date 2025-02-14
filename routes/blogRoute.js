const { homePage, singleBlog, createForm, createBlog, deleteBlog, renderUpdateBlog, updateBlog } = require('../controller/blogController')
const { isAuthenticated } = require('../middleware/isAuthenticated')



const router = require('express').Router()
const {multer,storage} = require('../middleware/multerConfig')
const upload = multer({ storage: storage })

router.route("/").get(homePage)
router.route("/blog/:id").get(singleBlog)
router.route("/delete/:id").get(isAuthenticated,deleteBlog)
router.route("/create").get(createForm).post(upload.single('image'),isAuthenticated,createBlog)
router.route("/update/:id").get(isAuthenticated, renderUpdateBlog)
router.route("/blog/:id").post(upload.single('image'), updateBlog)





module.exports = router