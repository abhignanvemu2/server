import express from "express";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Get public portfolio data
router.get('/public', async (req, res) => {
  try {
    const user = await User.findOne().select('-password -email -username -createdAt -updatedAt');
    if (!user) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update portfolio data
router.put('/update', auth, async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;