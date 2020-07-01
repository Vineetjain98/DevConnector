const express = require("express");
const { check, validationResult } = require("express-validator");
const auth = require("../../middlewear/auth");
const Post = require("../../models/Post");
const User = require("../../models/Users");
const Profile = require("../../models/Profile");
const router = express.Router();

// @route   POST api/post
// @desc    Create a post
// @access  Private
router.post(
  "/",
  [auth, check("text", "Text is required").not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user).select("-password");
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user,
      });
      const post = await newPost.save();

      res.json(post);
    } catch (error) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// @route :  GET api/posts
// @desc :   Get all posts
// @access : Public
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route :  GET api/posts/:post_id
// @desc :   Get post by id
// @access : Public
router.get("/:post_id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);
    if (!post) return res.status(404).json({ msg: "Post not found" });
    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).send("Server error");
  }
});

// @route :  DELETE api/posts/:post_id
// @desc :   Delete post by id
// @access : Private
router.delete("/:post_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);
    if (!post) return res.status(404).json({ msg: "Post not found" });
    if (post.user.toString() !== req.user) {
      return res.status(400).json({ msg: "User not authorized" });
    }
    await post.remove();
    res.json({ msg: "Post Removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).send("Server error");
  }
});

// @route :  PUT api/posts/like/:post_id
// @desc :   PUT like post by id
// @access : Private
router.put("/like/:post_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);
    if (!post) return res.status(404).json({ msg: "Post not found" });
    console.log(post);
    if (post.user.toString() === req.user) {
      return res.status(400).json({ msg: "User not authorized" });
    }
    if (
      post.likes.filter((like) => like.user.toString() == req.user).length > 0
    ) {
      return res.status(400).json({ msg: "Post already liked" });
    }
    post.likes.unshift({ user: req.user });
    post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).send("Server error");
  }
});

// @route :  PUT api/posts/unlike/:post_id
// @desc :   PUT like post by id
// @access : Private
router.put("/unlike/:post_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);
    if (!post) return res.status(404).json({ msg: "Post not found" });
    if (post.user.toString() === req.user) {
      return res.status(400).json({ msg: "User not authorized" });
    }
    if (
      post.likes.filter((like) => like.user.toString() == req.user).length === 0
    ) {
      return res.status(400).json({ msg: "Post has not been liked yet" });
    }
    const removeIndex = post.likes
      .map((like) => like.user.toString)
      .indexOf(req.user);
    post.likes.splice(removeIndex, 1);
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).send("Server error");
  }
});

// @route   POST api/posts/comment/:post_id
// @desc    Comment in a post
// @access  Private
router.post(
  "/comment/:post_id",
  [auth, check("text", "Text is required").not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user).select("-password");

      const post = await Post.findById(req.params.post_id);
      if (!post) return res.status(404).json({ msg: "Post not found" });
      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user,
      };
      post.comments.unshift(newComment);
      await post.save();
      res.json(post.comments);
    } catch (error) {
      console.error(error.message);
      if (error.kind == "ObjectId") {
        return res.status(404).json({ msg: "Post not found" });
      }
      res.status(500).send("Server error");
    }
  }
);
// @route   DELETE api/posts/:post_id/:comment_id
// @desc    Delete comment in a post
// @access  Private
router.delete("/:post_id/:comment_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );

    if (!comment) return res.status(404).json({ msg: "Comment not found" });

    if (comment.user != req.user)
      return res.status(404).json({ msg: "User not authorized" });

    const removeIndex = post.comments
      .map((comment) => comment.user.toString)
      .indexOf(req.user);
    post.comments.splice(removeIndex, 1);
    await post.save();
    res.json(post.comments);
  } catch (error) {
    console.error(error.message);
    if (error.kind == "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).send("Server error");
  }
});
module.exports = router;
