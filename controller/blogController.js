const { blogs, users, comments } = require("../model")

exports.homePage = async (req, res) => {
  try {
  const datas = await blogs.findAll({
    include: {
      model: users
    }
  })

    // Pass the user session to the template
  res.render("home", { blogs: datas , data: req.session.data || null })
  } catch (error) {
    console.log(error)
  }
}

exports.singleBlog = async (req, res) => {
  const id = req.params.id
  const blog = await blogs.findAll({
    where: {
      id: id
    },
    include: {
      model: users
    }
  })
  const commentsData = await comments.findAll({
    where: {
      blogId: id
    },
    include: {
      model: users
    }
  })

  res.render("singleBlog", { blog: blog, comments: commentsData })
}

exports.deleteBlog = async (req, res) => {
  const id = req.params.id
  await blogs.destroy({ where: { id: id } })
  res.redirect("/")
}

exports.renderUpdateBlog = async (req, res) => {
  const id = req.params.id
  const blog = await blogs.findAll({
    where: {
      id: id
    }
  })
  res.render("editBlog", { blog: blog })
}

exports.updateBlog = async (req, res) => {
  const id = req.params.id
  const { title, subtitle, description } = req.body
  const image = req.file ? req.file.filename : null // Check if image is uploaded

  try {
    const blog = await blogs.findOne({ where: { id } })
    if (!blog) return res.status(404).json({ error: 'Blog not found.' })
    await blogs.update(
      {
        title,
        subtitle,
        description
      },
      {
        where: {
          id: id
        }
      }
    )
    res.redirect(`/blog/${id}`)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update blog.' })
  }
}

exports.createForm = (req, res) => {
  res.render('create.ejs')
}

exports.createBlog = async (req, res) => {
  let filename
  if (req.file) {
    filename = req.file.filename
  } else {
    filename = ""
  }
  const { title, subtitle, description } = req.body
  await blogs.create({
    title,
    subtitle,
    description,
    image: filename,
    userId: req.userId
  })
  res.redirect("/")
}

exports.addComment = async (req, res) => {
  const {userId} = req
  const { commentMessage, blogId } = req.body
  if(!commentMessage || !blogId) return res.send("please provide a comment and blog id")
  await comments.create({
    commentMessage,
    userId,
    blogId
  })
  res.redirect(`/blog/${blogId}`)
}


exports.deleteComment = async (req, res) => {
  const { id } = req.params

  const {userId} = req

  const [comment] = await comments.findAll({
    where: {
      id
    }
  })
  const blogId = comment.blogId
  if (comment.userId !== userId){
    return res.send("you can't delete this comment")
  }

  await comments.destroy({
    where: {
      id
    }
  })
  res.redirect(`/blog/${blogId}`)
}