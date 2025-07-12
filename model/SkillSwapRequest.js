const mongoose = require('mongoose');

const SkillSwapRequestSchema = new mongoose.Schema(
  {
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    offeredSkill: { type: String, required: true },
    wantedSkill: { type: String, required: true },
    message: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    fromFeedback: {
      rating: Number,
      comment: String,
    },
    toFeedback: {
      rating: Number,
      comment: String,
    },
  },
  {
    collection: 'SkillSwapRequests',
    timestamps: true,
  }

);

mongoose.models = {};
const SkillSwapRequest = mongoose.model('SkillSwapRequest', SkillSwapRequestSchema);
module.exports = SkillSwapRequest;
