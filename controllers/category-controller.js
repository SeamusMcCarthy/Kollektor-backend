const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const Category = require("../models/category");

const getCategories = async (req, res, next) => {
  let categories;
  try {
    categories = await Category.find();
  } catch (e) {
    const error = new HttpError(
      "Fetching categories failed. Please try again later.",
      500
    );
    return next(error);
  }

  if (!categories || categories.length === 0) {
    return next(new HttpError("Could not find any categories.", 404));
  }
  res.json({
    categories: categories.map((category) =>
      category.toObject({ getters: true })
    ),
  });
};

const getCategory = async (req, res, next) => {
  const categoryId = req.params.cid;
  let category;
  try {
    category = await Category.findById(categoryId);
  } catch (e) {
    const error = new HttpError(
      "Something went wrong. Could not find an category for this ID.",
      500
    );
    return next(error);
  }

  if (!category) {
    const error = new HttpError(
      "Could not find an category for the provided ID",
      404
    );
    return next(error);
  }
  res.json({ category: category.toObject({ getters: true }) });
};

const createCategory = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError("Invalid input passed. Please check your data.", 422)
    );
  }
  const { title, description, image } = req.body;

  const createdCategory = new Category({
    title,
    description,
    entries: [],
    image,
  });

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await createdCategory.save({ session: session });
    await session.commitTransaction();
  } catch (e) {
    console.log(e.message);
    const error = new HttpError(
      "Creating category failed, please try again",
      500
    );
    return next(error);
  }

  res.status(201).json({ category: createdCategory });
};

const updateCategory = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError("Invalid input passed. Please check your data.", 422)
    );
  }

  const { title, description } = req.body;
  const categoryId = req.params.cid;

  let category;
  try {
    category = await Category.findById(categoryId);
  } catch (e) {
    const error = new HttpError(
      "Something went wrong. Could not update category.",
      500
    );
    return next(error);
  }

  category.title = title;
  category.description = description;

  try {
    await category.save();
  } catch (e) {
    const error = new HttpError(
      "Something went wrong. Could not update category",
      500
    );
    return next(error);
  }

  res.status(200).json({ category: category.toObject({ getters: true }) });
};

const deleteCategory = async (req, res, next) => {
  const categoryId = req.params.cid;
  let category;
  try {
    category = await Category.findById(categoryId).populate("entries");
  } catch (e) {
    const error = new HttpError(
      "Something went wrong. Could not delete category.",
      500
    );
    return next(error);
  }

  if (!category) {
    const error = new HttpError("Could not find a category for this id.", 404);
    return next(error);
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    await category.remove({ session: session });
    // TODO - remove entries associated with category.
    await session.commitTransaction();
  } catch (e) {
    const error = new HttpError(
      "Something went wrong. Could not delete entry.",
      500
    );
    return next(error);
  }

  res.status(200).json({ message: "Deleted category" });
};

exports.getCategories = getCategories;
exports.getCategory = getCategory;
exports.createCategory = createCategory;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;
