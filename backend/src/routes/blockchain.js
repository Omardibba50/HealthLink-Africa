const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const HealthRecord = require('../models/HealthRecord');
const AccessControl = require('../models/AccessControl');
const User = require('../models/User');
const { addHealthRecord, grantAccess, checkAccess, verifyTransaction, getBlockchainStatus } = require('../services/blockchain');
const crypto = require('crypto');




router.get('/status', async (req, res) => {
  try {
    const status = await getBlockchainStatus();
    res.json(status);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Route to add a health record
router.post('/add', auth, async (req, res) => {
  try {
    const patient = await User.findById(req.user.id);
    const recordHash = crypto.createHash('sha256').update(req.body.data).digest('hex');
    
    const txId = await addHealthRecord(patient.algorandAddress, recordHash);
    const verified = await verifyTransaction(txId);

    if (!verified) {
      return res.status(500).json({ msg: 'Failed to verify blockchain transaction' });
    }

    const newRecord = new HealthRecord({
      patient: req.user.id,
      data: req.body.data,
      transactionId: txId
    });
    const record = await newRecord.save();
    res.json(record);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Route to get health records for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const records = await HealthRecord.find({ patient: req.user.id });
    res.json(records);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Route to grant access to a doctor
router.post('/grant-access', auth, async (req, res) => {
  try {
    const doctor = await User.findOne({ email: req.body.doctorEmail });
    if (!doctor) return res.status(404).json({ msg: 'Doctor not found' });

    const patient = await User.findById(req.user.id);
    
    const txId = await grantAccess(patient.algorandAddress, doctor.algorandAddress);
    const verified = await verifyTransaction(txId);

    if (!verified) {
      return res.status(500).json({ msg: 'Failed to verify blockchain transaction' });
    }

    const newAccess = new AccessControl({
      patient: req.user.id,
      doctor: doctor.id,
      transactionId: txId
    });
    await newAccess.save();
    res.json({ msg: 'Access granted successfully', transactionId: txId });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Route to get health records for a specific patient (doctor access)
router.get('/:patientEmail', auth, async (req, res) => {
  try {
    const patient = await User.findOne({ email: req.params.patientEmail });
    if (!patient) return res.status(404).json({ msg: 'Patient not found' });

    const doctor = await User.findById(req.user.id);

    const hasAccess = await checkAccess(patient.algorandAddress, doctor.algorandAddress);
    if (!hasAccess) return res.status(403).json({ msg: 'Access denied' });

    const records = await HealthRecord.find({ patient: patient.id });
    res.json(records);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Route to get blockchain status

module.exports = router;