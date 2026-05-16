const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @route   POST /api/auth/register
// @desc    Register a new device with a UUID or return existing
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { uuid } = req.body;
    
    if (!uuid) {
      return res.status(400).json({ success: false, message: 'UUID is required' });
    }

    let user = await User.findOne({ uuid });
    const crypto = require('crypto');

    if (!user) {
      // Yeni kullanıcı için güvenli bir tokan oluştur
      const authToken = crypto.randomBytes(32).toString('hex');
      user = new User({ uuid, authToken });
      await user.save();
    } else if (!user.authToken) {
      // Eğer eski bir kullanıcıysa ve tokanı yoksa oluştur (Geriye dönük uyumluluk)
      user.authToken = crypto.randomBytes(32).toString('hex');
      await user.save();
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   POST /api/auth/generate-transfer-code
// @desc    Generate a 6-digit transfer code valid for 10 minutes
// @access  Public (Expects current UUID)
router.post('/generate-transfer-code', async (req, res) => {
  try {
    const { uuid } = req.body;
    
    if (!uuid) {
      return res.status(400).json({ success: false, message: 'UUID is required' });
    }

    const user = await User.findOne({ uuid });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Generate a 6-digit code
    const transferCode = Math.floor(100000 + Math.random() * 900000).toString();
    // Valid for 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60000);

    user.transferCode = transferCode;
    user.transferCodeExpiresAt = expiresAt;
    await user.save();

    res.json({ success: true, transferCode, expiresAt });
  } catch (error) {
    console.error('Generate Transfer Code Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   POST /api/auth/transfer-device
// @desc    Transfer data to new device using the 6-digit code
// @access  Public
router.post('/transfer-device', async (req, res) => {
  try {
    const { newUuid, transferCode } = req.body;

    if (!newUuid || !transferCode) {
      return res.status(400).json({ success: false, message: 'newUuid and transferCode are required' });
    }

    // Find the user with the transfer code and check expiry
    const oldUser = await User.findOne({ 
      transferCode, 
      transferCodeExpiresAt: { $gt: Date.now() } 
    });

    if (!oldUser) {
      return res.status(400).json({ success: false, message: 'Invalid or expired transfer code' });
    }

    // Change the UUID to the new device's UUID and rotate authToken
    const crypto = require('crypto');
    oldUser.uuid = newUuid;
    oldUser.authToken = crypto.randomBytes(32).toString('hex');
    oldUser.transferCode = null;
    oldUser.transferCodeExpiresAt = null;
    
    // Save updated user
    await oldUser.save();

    // If there was a temporary user created for this newUuid, delete it
    const existingTempUser = await User.findOne({ uuid: newUuid });
    if (existingTempUser && existingTempUser._id.toString() !== oldUser._id.toString()) {
        await User.deleteOne({ _id: existingTempUser._id });
    }
    
    res.json({ success: true, user: oldUser, message: 'Device transferred successfully' });
  } catch (error) {
    if (error.code === 11000) {
       // UUID already exists, delete it and try again
       const { newUuid, transferCode } = req.body;
       await User.deleteOne({ uuid: newUuid });
       const oldUser = await User.findOne({ transferCode });
       if(oldUser) {
          const crypto = require('crypto');
          oldUser.uuid = newUuid;
          oldUser.authToken = crypto.randomBytes(32).toString('hex');
          oldUser.transferCode = null;
          oldUser.transferCodeExpiresAt = null;
          await oldUser.save();
          return res.json({ success: true, user: oldUser, message: 'Device transferred successfully (overwritten temp)' });
       }
    }
    console.error('Transfer Device Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
