const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  body: { type: String, required: true },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  dateAdded: { type: Date, required: true },
  parentId: { type: String, required: false },
});

module.exports = mongoose.model("Comment", commentSchema);
