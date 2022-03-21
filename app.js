const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const entryRoutes = require("./routes/entry-routes");
const userRoutes = require("./routes/user-routes");
const categoryRoutes = require("./routes/category-routes");
const commentRoutes = require("./routes/comment-routes");
const HttpError = require("./models/http-error");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const cloudinary = require("cloudinary");
const app = express();

app.use(bodyParser.json());

dotenv.config();
cloudinary.config({
  cloud_name: process.env.name,
  api_key: process.env.key,
  api_secret: process.env.secret,
});

app.use("/uploads/images", express.static(path.join("uploads", "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

app.use("/api/v1/entry", entryRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/cat", categoryRoutes);
app.use("/api/v1/comment", commentRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, () => {
      console.log(error);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

dotenv.config();
mongoose
  .connect(process.env.KOLLEKTOR_DATABASE)
  .then(app.listen(5000))
  .catch((err) => {
    console.log(err.message);
  });
