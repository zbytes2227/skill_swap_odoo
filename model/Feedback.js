const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema(
  {
    User:  { type: Object },
    Message: { type: String },
    Star: { type: Number, required: true }, // added type and validation
  },
  { collection: "All-Feedback", timestamps: true }
);

// Clear existing model definition
mongoose.models = {};
const Feedbacks = mongoose.model("Feedback", FeedbackSchema);
module.exports = Feedbacks;
