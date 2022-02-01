const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const Entry = require("../models/entry");
const User = require("../models/user");
const mongooseUniqueValidator = require("mongoose-unique-validator");
const mongoose = require("mongoose");
const fs = require("fs");

const getEntries = async (req, res, next) => {
  let entries;
  try {
    entries = await Entry.find();
  } catch (e) {
    const error = new HttpError(
      "Fetching entries failed. Please try again later.",
      500
    );
    return next(error);
  }

  if (!entries || entries.length === 0) {
    return next(new HttpError("Could not find any entries.", 404));
  }
  res.json({
    entries: entries.map((entry) => entry.toObject({ getters: true })),
  });
};

const getEntryById = async (req, res, next) => {
  const entryId = req.params.eid;
  let entry;
  try {
    entry = await Entry.findById(entryId);
  } catch (e) {
    const error = new HttpError(
      "Something went wrong. Could not find an entry for this ID.",
      500
    );
    return next(error);
  }

  if (!entry) {
    const error = new HttpError(
      "Could not find an entry for the provided ID",
      404
    );
    return next(error);
  }
  res.json({ entry: entry.toObject({ getters: true }) });
};

const getEntriesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let entries;
  try {
    entries = await Entry.find({ creator: userId });
  } catch (e) {
    const error = new HttpError(
      "Fetching entries failed. Please try again later.",
      500
    );
    return next(error);
  }

  if (!entries || entries.length === 0) {
    return next(
      new HttpError("Could not find any entries for the provided user id", 404)
    );
  }
  res.json({
    entries: entries.map((entry) => entry.toObject({ getters: true })),
  });
};

const createEntry = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError("Invalid input passed. Please check your data.", 422)
    );
  }
  const { title, description, address } = req.body;
  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (e) {
    return next(e);
  }

  console.log(coordinates);
  const createdEntry = new Entry({
    title,
    description,
    address,
    location: coordinates,
    // image: req.file.path,
    image: "",
    creator,
    comments: [],
  });
  console.log(createdEntry);

  let user;
  try {
    user = await User.findById(creator);
  } catch (e) {
    const error = new HttpError("Creating place failed, please try again", 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Creating entry failed, invalid user", 404);
    return next(error);
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await createdEntry.save({ session: session });
    user.entries.push(createdEntry);
    await user.save({ session: session });
    await session.commitTransaction();
  } catch (e) {
    console.log(e.message);
    const error = new HttpError("Creating entry failed, please try again", 500);
    return next(error);
  }

  res.status(201).json({ entry: createdEntry });
};

const updateEntry = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError("Invalid input passed. Please check your data.", 422)
    );
  }

  const { title, description } = req.body;
  const entryId = req.params.eid;

  let entry;
  try {
    entry = await Entry.findById(entryId);
  } catch (e) {
    const error = new HttpError(
      "Something went wrong. Could not update entry.",
      500
    );
    return next(error);
  }

  //   TODO
  //   if (entry.creator.toString() !== req.userData.userId) {
  //     const error = new HttpError("You are not allowed to edit this place", 401);
  //     return next(error);
  //   }

  entry.title = title;
  entry.description = description;

  try {
    await entry.save();
  } catch (e) {
    const error = new HttpError(
      "Something went wrong. Could not update entry",
      500
    );
    return next(error);
  }

  res.status(200).json({ entry: entry.toObject({ getters: true }) });
};

const deleteEntry = async (req, res, next) => {
  const entryId = req.params.eid;
  let entry;
  try {
    entry = await Entry.findById(entryId).populate("creator");
  } catch (e) {
    const error = new HttpError(
      "Something went wrong. Could not delete place.",
      500
    );
    return next(error);
  }

  if (!entry) {
    const error = new HttpError("Could not find a place for this id.", 404);
    return next(error);
  }

  //   TODO
  //   if (place.creator.id !== req.userData.userId) {
  //     const error = new HttpError("You are not allowed to delete this place", 40);
  //     return next(error);
  //   }

  const imagePath = entry.image;

  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    await entry.remove({ session: session });
    entry.creator.entries.pull(entry);
    await entry.creator.save({ session: session });
    await session.commitTransaction();
  } catch (e) {
    const error = new HttpError(
      "Something went wrong. Could not delete entry.",
      500
    );
    return next(error);
  }
  //   TODO
  //   fs.unlink(imagePath, (err) => {
  //     console.log(err);
  //   });
  res.status(200).json({ message: "Deleted place" });
};

exports.getEntries = getEntries;
exports.getEntryById = getEntryById;
exports.getEntriesByUserId = getEntriesByUserId;
exports.createEntry = createEntry;
exports.updateEntry = updateEntry;
exports.deleteEntry = deleteEntry;
