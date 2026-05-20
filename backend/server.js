require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const assessmentRoutes = require('./routes/assessment');
const contentRoutes = require('./routes/content');
const adminRoutes = require('./routes/admin');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Backend is running smoothly' }));

// Admin Panel Production Static Files Serve
const path = require('path');
app.use(express.static(path.join(__dirname, '../admin-panel/dist')));

// React Router Catch-all (API istekleri hariç her şeyi React'e yönlendir)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin-panel/dist/index.html'));
});

// Server & DB Setup
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/english-learning-app';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
