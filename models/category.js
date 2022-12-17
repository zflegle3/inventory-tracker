const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const GenreSchema = new Schema({
  name: { type: String, min: 1, max: 100, required: true },
  description: { type: String, required: true, maxLength: 500 },
});

// Virtual for genre's URL
GenreSchema.virtual("url").get(function () {
  return `/genre/${this._id}`;
});

// Export model
module.exports = mongoose.model("Genre", GenreSchema);