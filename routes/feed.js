const express = require("express");
const feedBackController = require("../controllers/feed");

const router = express.Router();

router.get("/posts", feedBackController.getPosts);
router.post("/posts", feedBackController.createPost);

module.exports = router;
