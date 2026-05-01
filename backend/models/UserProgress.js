const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
  userUuid: { 
    type: String, 
    required: true,
    index: true
  },
  contentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Content', 
    required: true,
    index: true
  },
  moduleType: {
    type: String,
    enum: ['vocabulary', 'reading', 'writing', 'listening'],
    required: true
  },
  
  // SuperMemo-2 / Spaced Repetition Alanları
  repetitions: { type: Number, default: 0 },
  easeFactor: { type: Number, default: 2.5 },
  interval: { type: Number, default: 1 }, // Gün cinsinden sonraki tekrar süresi
  nextReviewDate: { type: Date, default: Date.now },
  lastSolvedAt: { type: Date, default: null }, // Bugün çözülüp çözülmediğini anlamak için
  
  // İstatistikler
  correctCount: { type: Number, default: 0 },
  incorrectCount: { type: Number, default: 0 },
  
  lastScore: { type: Number, min: 0, max: 100, default: null }
}, { timestamps: true });

// Aynı kullanıcı aynı içeriği birden fazla kez progress tablosuna eklememeli
userProgressSchema.index({ userUuid: 1, contentId: 1, moduleType: 1 }, { unique: true });

module.exports = mongoose.model('UserProgress', userProgressSchema);
