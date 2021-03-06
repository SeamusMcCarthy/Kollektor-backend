const express = require("express");
const { check } = require("express-validator");
const commentController = require("../controllers/comment-controller");
const router = express.Router();
const checkAuth = require("../middleware/check-auth");

router.get("/", commentController.getComments);
router.get("/:cid", commentController.getCommentById);
router.get("/entry/:eid", commentController.getCommentsByEntryId);

router.use(checkAuth);
router.post(
  "/:eid",
  [check("body").not().isEmpty()],
  commentController.createComment
);
router.patch(
  "/:cid",
  [check("body").not().isEmpty()],
  commentController.updateComment
);
router.delete("/:cid", commentController.deleteComment);
module.exports = router;
