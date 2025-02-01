const { blogs, users } = require("../model");

exports.homePage = async (req, res) => {
  try {
  const datas = await blogs.findAll({
    include: {
      model: users,
    },
  });

    // Pass the user session to the template
  res.render("home", { blogs: datas , data: req.session.data || null });
  } catch (error) {
    console.log(error);
  
  }
};

exports.singleBlog = async (req, res) => {
  const id = req.params.id;
  const blog = await blogs.findAll({
    where: {
      id: id,
    },
    include: {
      model: users,
    },
  });
  res.render("singleBlog", { blog: blog });
};

exports.deleteBlog = async (req, res) => {
  const id = req.params.id;
  await blogs.destroy({ where: { id: id } });
  res.redirect("/");
};

exports.renderUpdateBlog = async (req, res) => {
  const id = req.params.id;
  const blog = await blogs.findAll({
    where: {
      id: id,
    },
  });
  res.render("editBlog", { blog: blog });
};

exports.updateBlog = async (req, res) => {
  const id = req.params.id;
  const { title, subtitle, description } = req.body;

  try {
    await blogs.update(
      {
        title,
        subtitle,
        description,
      },
      {
        where: {
          id: id,
        },
      }
    );
    res.redirect(`/blog/${id}`);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update blog.' });
  }
 
};

exports.createForm = (req, res) => {
  res.render('create.ejs');
};

exports.createBlog = async (req, res) => {
  let filename;
  if (req.file) {
    filename = req.file.filename;
  } else {
    filename = "";
  }
  const { title, subtitle, description } = req.body;
  await blogs.create({
    title,
    subtitle,
    description,
    image: filename,
    userId: req.userId,
  });
  res.redirect("/");
};
