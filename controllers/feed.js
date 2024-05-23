const { validationResult } = require("express-validator");
const Post = require("../models/post");
const mongoDb = require("mongodb");
const fs = require("fs");
const path = require("path");

exports.getPosts = (req, res, next) => {
  const page = req.query.page || 1;
  const postsInPage = 2;
  let totalPosts;
  Post.find()
    .countDocuments()
    .then((count) => {
      totalPosts = count;
      return Post.find()
        .skip((page - 1) * postsInPage)
        .limit(postsInPage);
    })
    .then((posts) => {
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
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.createPost = (req, res, next) => {
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
    creator: { name: "sunil" },
  });
  post
    .save()
    .then((result) => {
      res.status(201).json({
        message: "Post created successfully!",
        post: result,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Post is not found!");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: "Post found successfully!", post: post });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updatePost = (req, res, next) => {
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

  if (!imageUrl) {
    const error = new Error("No Image picked!!");
    error.statusCode = 422;
    throw error;
  }

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Post is not found!");
        error.statusCode = 404;
        throw error;
      }
      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }
      post.title = title;
      post.content = content;
      post.imageUrl = imageUrl;
      return post.save();
    })
    .then((result) => {
      res
        .status(200)
        .json({ message: "Post updated successfully!", post: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Post was not found!!");
        error.statusCode = 404;
        throw error;
      }
      clearImage(post.imageUrl);
      return Post.deleteOne({ _id: new mongoDb.ObjectId(postId) });
    })
    .then(() => {
      res.status(202).json({ message: "Post deleted successfully!" });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => {
    if (err) {
      console.log(err);
    }
  });
};

