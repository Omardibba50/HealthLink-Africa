const mongoose = require('mongoose');

const HealthRecordSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  data: { type: String, required: true },
  date: { type: Date, default: Date.now },
  transactionId: { type: String, required: true }
});

module.exports = mongoose.model('HealthRecord', HealthRecordSchema);