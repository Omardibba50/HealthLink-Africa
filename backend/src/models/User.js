const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['patient', 'doctor'], required: true },
  algorandAddress: { type: String, unique: true },
  hllaBalance: { type: Number, default: 0 },
});

module.exports = mongoose.model('User', UserSchema);
