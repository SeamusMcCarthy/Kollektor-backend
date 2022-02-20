const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const Entry = require("../models/entry");
const User = require("../models/user");
const Category = require("../models/category");
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
    entry = await Entry.findById(entryId)
      // .populate("comments")
      // .populate("creator");
      .populate({
        path: "comments",
        populate: { path: "creator", model: "User" },
      });
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

const getEntriesByCategoryId = async (req, res, next) => {
  const catId = req.params.cid;

  let entries;
  try {
    entries = await Entry.find({ category: catId });
  } catch (e) {
    const error = new HttpError(
      "Fetching entries failed. Please try again later.",
      500
    );
    return next(error);
  }

  if (!entries || entries.length === 0) {
    return next(
      new HttpError(
        "Could not find any entries for the provided category id",
        404
      )
    );
  }
  res.json({
    entries: entries.map((entry) => entry.toObject({ getters: true })),
  });
};

const createEntry = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid input passed. Please check your data.", 422)
    );
  }
  const { title, description, address, creator, category } = req.body;
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
    image: req.file.path,
    creator,
    category: "61fe85160b5a01e0d5915999",
    comments: [],
    dateAdded: new Date().getTime(),
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch (e) {
    const error = new HttpError(
      "Creating entry failed, error finding user",
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError(
      "Creating entry failed, no user with that id",
      404
    );
    return next(error);
  }
  console.log("Category : " + category);
  let cat;
  try {
    // cat = await Category.findById(category);
    cat = await Category.findOne({ title: category }).collation({
      locale: "en",
      strength: 2,
    });
  } catch (e) {
    const error = new HttpError(
      "Creating entry failed, error finding category",
      500
    );
    return next(error);
  }

  if (!cat) {
    const error = new HttpError("Creating entry failed, invalid category", 404);
    return next(error);
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    // Save created entry
    await createdEntry.save({ session: session });

    // Update entries for creating user
    user.entries.push(createdEntry);
    await user.save({ session: session });

    // Update entries for select category
    cat.entries.push(createdEntry);
    await cat.save({ session: session });
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
      "Something went wrong. Could not delete entry.",
      500
    );
    return next(error);
  }

  if (!entry) {
    const error = new HttpError("Could not find an entry for this id.", 404);
    return next(error);
  }

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
  res.status(200).json({ message: "Deleted entry" });
};

exports.getEntries = getEntries;
exports.getEntryById = getEntryById;
exports.getEntriesByUserId = getEntriesByUserId;
exports.getEntriesByCategoryId = getEntriesByCategoryId;
exports.createEntry = createEntry;
exports.updateEntry = updateEntry;
exports.deleteEntry = deleteEntry;
