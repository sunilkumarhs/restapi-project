const { validationResult } = require("express-validator");
const Post = require("../models/post");
const mongoDb = require("mongodb");
const fs = require("fs");
const path = require("path");
const User = require("../models/user");
const io = require("../socket");

exports.getPosts = async (req, res, next) => {
  const page = req.query.page || 1;
  const postsInPage = 2;
  try {
    const totalPosts = await Post.find().countDocuments();
    const posts = await Post.find()
      .populate("creator")
      .sort({ createdAt: -1 })
      .skip((page - 1) * postsInPage)
      .limit(postsInPage);
    if (!posts) {
      const error = new Error("Fetching of posts failed!!");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      message: "Fetching of Posts is Successfull!",
      posts: posts,
      totalItems: totalPosts,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.createPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(
      "Validation of Post is failed!!, entered data is incorrect!!"
    );
    error.statusCode = 422;
    throw error;
  }
  if (!req.file) {
    const error = new Error("No Image file found!!");
    error.statusCode = 422;
    throw error;
  }
  const imageUrl = req.file.path.replace("\\", "/");
  const title = req.body.title;
  const content = req.body.content;
  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: req.userId,
  });
  try {
    await post.save();
    const user = await User.findById(req.userId);
    user.posts.push(post);
    await user.save();
    io.getIO().emit("posts", {
      action: "create",
      post: { ...post._doc, creator: { _id: user._id, name: user.name } },
    });
    res.status(201).json({
      message: "Post created successfully!",
      post: post,
      creator: { _id: user._id, name: user.name },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getPost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error("Post is not found!!");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ message: "Post fetched successfully!", post: post });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updatePost = async (req, res, next) => {
  const postId = req.params.postId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(
      "Validation of Post is failed!!, entered data is incorrect!!"
    );
    error.statusCode = 422;
    throw error;
  }
  let imageUrl = req.body.image;
  const title = req.body.title;
  const content = req.body.content;
  if (req.file) {
    imageUrl = req.file.path.replace("\\", "/");
  }

  try {
    if (!imageUrl) {
      const error = new Error("No Image picked!!");
      error.statusCode = 422;
      throw error;
    }
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error("Post is not found!");
      error.statusCode = 404;
      throw error;
    }
    if (post.creator.toString() !== req.userId) {
      const error = new Error("Not Autherized!!");
      error.statusCode = 403;
      throw error;
    }
    if (imageUrl !== post.imageUrl) {
      clearImage(post.imageUrl);
    }
    post.title = title;
    post.content = content;
    post.imageUrl = imageUrl;
    const result = await post.save();
    const user = await User.findById(req.userId);
    io.getIO().emit("posts", {
      action: "update",
      post: { ...post._doc, creator: { _id: user._id, name: user.name } },
    });
    res.status(200).json({
      message: "Post updated successfully!",
      post: result,
      creator: { _id: user._id, name: user.name },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error("Post was not found!!");
      error.statusCode = 404;
      throw error;
    }
    if (post.creator.toString() !== req.userId) {
      const error = new Error("Not Autherized!!");
      error.statusCode = 403;
      throw error;
    }
    clearImage(post.imageUrl);
   z;
    const user = await User.findById(req.userId);
    user.posts.pull(postId);
    await user.save();
    io.getIO().emit("posts", {
      action: "delete",
      post: post,
    });
    res.status(202).json({ message: "Post deleted successfully!" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => {
    if (err) {
      console.log(err);
    }
  });
};

