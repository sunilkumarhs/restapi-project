exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [{ title: "My First Post", content: "This is first post posted!" }],
  });
};

exports.createPost = (req, res, next) => {
  const title = req.body.title;
  const content = req.body.content;
  console.log(title);
  console.log(content);
  res.status(201).json({
    message: "Post created successfully!",
    post: { id: new Date().toISOString(), title: title, content: content },
  });
};
