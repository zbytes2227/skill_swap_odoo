const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    location: { type: String, default: '' },
    profilePhoto: { type: String, default: '' }, // Store image URL or base64
    profileType: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },

    skillsOffered: { type: [String], default: [] },
    skillsWanted: { type: [String], default: [] },

    availability: {
      type: [String],
      enum: ['weekdays', 'weekends', 'mornings', 'evenings', 'nights'],
      default: [],
    }, 
    isBanned: { type: Boolean, default: false },
  },
  {
    collection: 'All-Users',
    timestamps: true,
  }
);

mongoose.models = {};
const Users = mongoose.model('Users', UserSchema);
module.exports = Users;
