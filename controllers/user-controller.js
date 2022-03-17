const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const User = require("../models/user");
const getCoordsForAddress = require("../util/location");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (e) {
    const error = new HttpError(
      "Fetching users failed. Please try again later.",
      500
    );
    return next(error);
  }

  if (!users || users.length === 0) {
    return next(new HttpError("Could not find any users.", 404));
  }
  res.json({
    users: users.map((user) => user.toObject({ getters: true })),
  });
};

const getUser = async (req, res, next) => {
  const userId = req.params.uid;
  let user;
  try {
    user = await User.findById(userId);
  } catch (e) {
    const error = new HttpError(
      "Something went wrong. Could not find a user.",
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError(
      "Could not find a user for the provided id",
      404
    );
    return next(error);
  }
  res.json({ user: user.toObject({ getters: true }) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError("Invalid input passed. Please check your data.", 422)
    );
  }

  const { name, email, password, address } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (e) {
    const error = new HttpError(
      "Signing up failed. Please try again later2",
      500
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError("User already exists. Please try again.", 422);
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (e) {
    const error = new HttpError("Could not create user, please try again", 500);
    return next(error);
  }

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (e) {
    return next(e);
  }

  const createdUser = new User({
    name,
    email,
    password: hashedPassword,
    address,
    location: coordinates,
    image: req.file.path,
    entries: [],
  });

  try {
    await createdUser.save();
  } catch (e) {
    const error = new HttpError("Signup failed. Please try again later1.", 500);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      "supersecret_dont_share",
      { expiresIn: "2h" }
    );
  } catch (e) {
    const error = new HttpError("Signup failed. Please try again later.", 500);
    return next(error);
  }

  res
    .status(201)
    // .json({ user: createdUser.toObject({ getters: true }), token: token });
    .json({ userId: createdUser.id, email: createdUser.email, token: token });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (e) {
    const error = new HttpError(
      "Logging in failed. Please try again later",
      500
    );
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      "Invalid credentials. Could not log you in.",
      403
    );
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (e) {
    const error = new HttpError("Could not login, please try again.", 500);
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError(
      "Could not login, please check your credentials",
      403
    );
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      "supersecret_dont_share",
      { expiresIn: "2h" }
    );
  } catch (e) {
    const error = new HttpError(
      "Logging in failed. Please try again later.",
      500
    );
    return next(error);
  }

  res.status(200).json({
    message: "Logged in",
    userId: existingUser.id,
    email: existingUser.email,
    token: token,
  });
};

const updateUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError("Invalid input passed. Please check your data.", 422)
    );
  }

  const { email, password, name, address } = req.body;
  const userId = req.params.uid;

  let user;
  try {
    user = await User.findById(userId);
  } catch (e) {
    const error = new HttpError(
      "Something went wrong. Could not update user.",
      500
    );
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (e) {
    const error = new HttpError("Could not create user, please try again", 500);
    return next(error);
  }

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (e) {
    return next(e);
  }

  user.email = email;
  user.password = hashedPassword;
  user.name = name;
  user.address = address;
  user.coordinates = coordinates;

  try {
    await user.save();
  } catch (e) {
    const error = new HttpError(
      "Something went wrong. Could not update user",
      500
    );
    return next(error);
  }

  res.status(200).json({ user: user.toObject({ getters: true }) });
};

exports.getUsers = getUsers;
exports.getUser = getUser;
exports.signup = signup;
exports.login = login;
exports.updateUser = updateUser;
