const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const { distributeTokens } = require('../services/blockchain');

router.post('/distribute', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.user.id);
    await distributeTokens(user.algorandAddress, amount);
    user.hllaBalance += amount;
    await user.save();
    res.json({ msg: 'Tokens distributed successfully', balance: user.hllaBalance });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/balance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ balance: user.hllaBalance });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
