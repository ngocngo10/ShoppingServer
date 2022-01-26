const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  isAdmin: {
    type: Boolean,
    required: true,
    default: false
  },

  isLock: {
    type: Boolean,
    default: false,
  },
  address: {
    city: String,
    street: String,
    number: Number,
  },
  phoneNumber: {
    type: String
  }
},
  {
    timestamps: true
  });

const User = mongoose.model("User", userSchema);
module.exports = mongoose.model.User || mongoose.model("User", userSchema);
