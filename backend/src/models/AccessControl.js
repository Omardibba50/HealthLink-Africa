const mongoose = require('mongoose');

const AccessControlSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  granted: { type: Boolean, default: true },
  transactionId: { type: String, required: true }
});

module.exports = mongoose.model('AccessControl', AccessControlSchema);