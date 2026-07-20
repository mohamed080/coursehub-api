const express = require("express");

const commentsController = require("../controllers/comments.controller");
const protect = require("../middleware/auth.middleware");
const optionalAuth = require("../middleware/optionalAuth.middleware");
const validateRequest = require("../middleware/validation.middleware");

const {
  createCommentValidation,
  commentIdValidation,
} = require("../validators/comment.validator");
const { lessonIdValidation } = require("../validators/lesson.validator");

const router = express.Router();

router
  .route("/lessons/:lessonId/comments")
  .get(
    optionalAuth,
    lessonIdValidation,
    validateRequest,
    commentsController.getLessonComments
  )
  .post(
    protect,
    lessonIdValidation,
    createCommentValidation,
    validateRequest,
    commentsController.addLessonComment
  );

router
  .route("/comments/:commentId/replies")
  .get(
    optionalAuth,
    commentIdValidation,
    validateRequest,
    commentsController.getCommentReplies
  )
  .post(
    protect,
    commentIdValidation,
    createCommentValidation,
    validateRequest,
    commentsController.addCommentReply
  );

router
  .route("/comments/:commentId")
  .patch(
    protect,
    commentIdValidation,
    createCommentValidation,
    validateRequest,
    commentsController.updateComment
  )
  .delete(
    protect,
    commentIdValidation,
    validateRequest,
    commentsController.deleteComment
  );

module.exports = router;
