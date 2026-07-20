const Comment = require("../models/comment.model");
const Lesson = require("../models/lesson.model");
const Course = require("../models/course.model");

const asyncWrapper = require("../middleware/asyncWrapper");
const AppError = require("../utils/appError");
const httpStatusText = require("../utils/httpStatusText");
const getPagination = require("../helpers/pagination.helper");
const { canAccessLesson, isCourseManager } = require("../helpers/lessonAccess.helper");

const getLessonComments = asyncWrapper(async (req, res, next) => {
  const lesson = await Lesson.findById(req.params.lessonId).populate("course");

  if (!lesson) {
    return next(new AppError("Lesson not found", 404, httpStatusText.FAIL));
  }

  const hasAccess = await canAccessLesson({
    lesson,
    course: lesson.course,
    user: req.user,
  });

  if (!hasAccess) {
    return next(
      new AppError(
        "You must be enrolled to view comments on this lesson",
        403,
        httpStatusText.FAIL
      )
    );
  }

  const { page, limit, skip } = getPagination(req.query);

  const filter = {
    lesson: lesson._id,
    parentComment: null,
  };

  const [comments, totalComments] = await Promise.all([
    Comment.find(filter)
      .populate("user", "firstName lastName avatar role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Comment.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalComments / limit);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    results: comments.length,
    data: {
      comments,
      pagination: {
        currentPage: page,
        limit,
        totalComments,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    },
  });
});

const addLessonComment = asyncWrapper(async (req, res, next) => {
  const lesson = await Lesson.findById(req.params.lessonId).populate("course");

  if (!lesson) {
    return next(new AppError("Lesson not found", 404, httpStatusText.FAIL));
  }

  // To create a comment, the user must be able to access the lesson
  const hasAccess = await canAccessLesson({
    lesson,
    course: lesson.course,
    user: req.user,
  });

  if (!hasAccess) {
    return next(
      new AppError(
        "You must be enrolled to comment on this lesson",
        403,
        httpStatusText.FAIL
      )
    );
  }

  const comment = await Comment.create({
    content: req.body.content,
    lesson: lesson._id,
    course: lesson.course._id,
    user: req.user._id,
    parentComment: null,
  });

  await comment.populate("user", "firstName lastName avatar role");

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    message: "Comment added successfully",
    data: {
      comment,
    },
  });
});

const getCommentReplies = asyncWrapper(async (req, res, next) => {
  const parentComment = await Comment.findById(req.params.commentId).populate("lesson");

  if (!parentComment) {
    return next(new AppError("Comment not found", 404, httpStatusText.FAIL));
  }

  const course = await Course.findById(parentComment.course);
  
  if (course) {
    const hasAccess = await canAccessLesson({
      lesson: parentComment.lesson,
      course: course,
      user: req.user,
    });
  
    if (!hasAccess) {
      return next(
        new AppError(
          "You do not have permission to view replies",
          403,
          httpStatusText.FAIL
        )
      );
    }
  }

  const { page, limit, skip } = getPagination(req.query);

  const filter = {
    parentComment: parentComment._id,
  };

  const [replies, totalReplies] = await Promise.all([
    Comment.find(filter)
      .populate("user", "firstName lastName avatar role")
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit),
    Comment.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalReplies / limit);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    results: replies.length,
    data: {
      replies,
      pagination: {
        currentPage: page,
        limit,
        totalReplies,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    },
  });
});

const addCommentReply = asyncWrapper(async (req, res, next) => {
  const parentComment = await Comment.findById(req.params.commentId).populate("lesson");

  if (!parentComment) {
    return next(new AppError("Parent comment not found", 404, httpStatusText.FAIL));
  }

  const course = await Course.findById(parentComment.course);
  
  if (!course) {
    return next(new AppError("Course not found", 404, httpStatusText.FAIL));
  }

  const hasAccess = await canAccessLesson({
    lesson: parentComment.lesson,
    course: course,
    user: req.user,
  });

  if (!hasAccess) {
    return next(
      new AppError(
        "You must be enrolled to reply to this comment",
        403,
        httpStatusText.FAIL
      )
    );
  }

  const reply = await Comment.create({
    content: req.body.content,
    lesson: parentComment.lesson._id,
    course: course._id,
    user: req.user._id,
    parentComment: parentComment._id,
  });

  await reply.populate("user", "firstName lastName avatar role");

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    message: "Reply added successfully",
    data: {
      reply,
    },
  });
});

const updateComment = asyncWrapper(async (req, res, next) => {
  const comment = await Comment.findById(req.params.commentId);

  if (!comment) {
    return next(new AppError("Comment not found", 404, httpStatusText.FAIL));
  }

  if (comment.user.toString() !== req.user._id.toString()) {
    return next(
      new AppError(
        "You can only update your own comments",
        403,
        httpStatusText.FAIL
      )
    );
  }

  comment.content = req.body.content;
  await comment.save();

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Comment updated successfully",
    data: {
      comment,
    },
  });
});

const deleteComment = asyncWrapper(async (req, res, next) => {
  const comment = await Comment.findById(req.params.commentId).populate("course");

  if (!comment) {
    return next(new AppError("Comment not found", 404, httpStatusText.FAIL));
  }

  const isOwner = comment.user.toString() === req.user._id.toString();
  const isManager = isCourseManager(comment.course, req.user);

  if (!isOwner && !isManager) {
    return next(
      new AppError(
        "You do not have permission to delete this comment",
        403,
        httpStatusText.FAIL
      )
    );
  }

  await comment.deleteOne();
  
  // Optionally, we can also delete all replies to this comment
  await Comment.deleteMany({ parentComment: comment._id });

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Comment deleted successfully",
    data: null,
  });
});

module.exports = {
  getLessonComments,
  addLessonComment,
  getCommentReplies,
  addCommentReply,
  updateComment,
  deleteComment,
};
