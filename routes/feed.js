const express = require("express");
const { body } = require("express-validator");
const feedBackController = require("../controllers/feed");

const router = express.Router();

router.get("/posts", feedBackController.getPosts);
router.post(
  "/post",
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  feedBackController.createPost
);
router.get("/post/:postId", feedBackController.getPost);
router.put(
  "/post/:postId",
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  feedBackController.updatePost
);

module.exports = router;
