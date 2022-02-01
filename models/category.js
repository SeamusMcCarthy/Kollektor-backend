const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  entries: [{ type: mongoose.Types.ObjectId, required: true, ref: "Entry" }],
});

module.exports = mongoose.model("Category", categorySchema);
