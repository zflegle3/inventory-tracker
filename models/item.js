const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ItemSchema = new Schema({
  title: { type: String, required: true, maxLength: 100 },
  artist: { type: String, required: true, maxLength: 100 },
  description: { type: String, required: true, maxLength: 500 },
  format: { type: String, required: true, maxLength: 100 },
  release: { type: String, required: true, maxLength: 100 },
  rating: { type: Number, required: true, min: 0, max: 5},
  price: { type: Number, required: true, min: 0},
  quantity: { type: Number, required: true, min: 0},
  genre: [{ type: Schema.Types.ObjectId, ref: "Genre" }],
});

// Virtual for item's URL
ItemSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/record/${this._id}`;
});

// Export model
module.exports = mongoose.model("item", ItemSchema);