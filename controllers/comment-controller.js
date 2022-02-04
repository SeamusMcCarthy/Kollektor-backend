const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const Entry = require("../models/entry");
const mongooseUniqueValidator = require("mongoose-unique-validator");
const mongoose = require("mongoose");

const getComments = async (req, res, next) => {
  let comments;
  try {
    comments = await Comment.find();
  } catch (e) {
    const error = new HttpError(
      "Fetching comments failed. Please try again later.",
      500
    );
    return next(error);
  }

  if (!comments || comments.length === 0) {
    return next(new HttpError("Could not find any comments.", 404));
  }
  res.json({
    comments: comments.map((comment) => comment.toObject({ getters: true })),
  });
};

const getCommentById = async (req, res, next) => {
  const commentId = req.params.cid;
  let comment;
  try {
    comment = await Comment.findById(commentId);
  } catch (e) {
    const error = new HttpError(
      "Something went wrong. Could not find a comment for this ID.",
      500
    );
    return next(error);
  }

  if (!comment) {
    const error = new HttpError(
      "Could not find a comment for the provided ID",
      404
    );
    return next(error);
  }
  res.json({ comment: comment.toObject({ getters: true }) });
};

const getCommentsByEntryId = async (req, res, next) => {
  const entryId = req.params.eid;

  let comments;
  try {
    comments = await Comment.find({ parentId: entryId });
  } catch (e) {
    const error = new HttpError(
      "Fetching entries failed. Please try again later.",
      500
    );
    return next(error);
  }

  if (!comments || comments.length === 0) {
    return next(
      new HttpError(
        "Could not find any comments for the provided entry id",
        404
      )
    );
  }
  res.json({
    comments: comments.map((comment) => comment.toObject({ getters: true })),
  });
};

const createComment = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError("Invalid input passed. Please check your data.", 422)
    );
  }
  const { body, creator } = req.body;
  const entryId = req.params.eid;

  const createdComment = new Comment({
    body,
    dateAdded: new Date().getTime(),
    creator,
    parentId: null,
  });
  console.log(createdComment);

  let entry;
  try {
    entry = await Entry.findById(entryId);
  } catch (e) {
    const error = new HttpError(
      "Creating comment failed, please try again",
      500
    );
    return next(error);
  }

  if (!entry) {
    const error = new HttpError("Creating comment failed, invalid entry", 404);
    return next(error);
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await createdComment.save({ session: session });
    entry.comments.push(createdComment);
    await entry.save({ session: session });
    await session.commitTransaction();
  } catch (e) {
    console.log(e.message);
    const error = new HttpError(
      "Creating comment failed, please try again",
      500
    );
    return next(error);
  }

  res.status(201).json({ comment: createdComment });
};

const updateComment = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError("Invalid input passed. Please check your data.", 422)
    );
  }

  const { body } = req.body;
  const commentId = req.params.cid;

  let comment;
  try {
    comment = await Comment.findById(commentId);
  } catch (e) {
    const error = new HttpError(
      "Something went wrong. Could not update comment.",
      500
    );
    return next(error);
  }

  //   TODO
  //   if (entry.creator.toString() !== req.userData.userId) {
  //     const error = new HttpError("You are not allowed to edit this place", 401);
  //     return next(error);
  //   }

  comment.body = body;

  try {
    await comment.save();
  } catch (e) {
    const error = new HttpError(
      "Something went wrong. Could not update comment",
      500
    );
    return next(error);
  }

  res.status(200).json({ comment: comment.toObject({ getters: true }) });
};

const deleteComment = async (req, res, next) => {
  const commentId = req.params.cid;
  let comment;
  try {
    // comment = await Comment.findById(commentId).populate("creator");
    comment = await Comment.findById(commentId);
  } catch (e) {
    const error = new HttpError(
      "Something went wrong. Could not delete comment.",
      500
    );
    return next(error);
  }

  if (!comment) {
    const error = new HttpError("Could not find a comment for this id.", 404);
    return next(error);
  }

  //   TODO
  //   if (place.creator.id !== req.userData.userId) {
  //     const error = new HttpError("You are not allowed to delete this place", 40);
  //     return next(error);
  //   }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    await comment.remove({ session: session });
    // entry.creator.entries.pull(entry);
    // await entry.creator.save({ session: session });
    await session.commitTransaction();
  } catch (e) {
    const error = new HttpError(
      "Something went wrong. Could not delete comment.",
      500
    );
    return next(error);
  }

  res.status(200).json({ message: "Deleted comment" });
};

exports.getComments = getComments;
exports.getCommentById = getCommentById;
exports.getCommentsByEntryId = getCommentsByEntryId;
exports.createComment = createComment;
exports.updateComment = updateComment;
exports.deleteComment = deleteComment;
