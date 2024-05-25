const express = require("express");
const { body } = require("express-validator");
const feedBackController = require("../controllers/feed");
const isAuth = require("../middlewares/is-Auth");

const router = express.Router();

router.get("/posts", isAuth, feedBackController.getPosts);
router.post(
  "/post",
  isAuth,
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  feedBackController.createPost
);
router.get("/post/:postId", isAuth, feedBackController.getPost);
router.put(
  "/post/:postId",
  isAuth,
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  feedBackController.updatePost
);
router.delete("/post/:postId", isAuth, feedBackController.deletePost);

module.exports = router;
