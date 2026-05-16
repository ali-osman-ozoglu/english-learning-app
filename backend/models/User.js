const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uuid: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  },
  authToken: { 
    type: String, 
    default: null,
    index: true 
  },
  transferCode: { 
    type: String, 
    default: null,
    index: true 
  },
  transferCodeExpiresAt: { 
    type: Date, 
    default: null 
  },
  // Kullanıcının her modül için bulunduğu seviyeler
  level: {
    vocabulary: { type: String, enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'UNTESTED'], default: 'UNTESTED' },
    reading: { type: String, enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'UNTESTED'], default: 'UNTESTED' },
    writing: { type: String, enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'UNTESTED'], default: 'UNTESTED' },
    listening: { type: String, enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'UNTESTED'], default: 'UNTESTED' }
  },
  // Bulunduğu seviyedeki ilerleme yüzdesi (0-100)
  progress: {
    vocabulary: { type: Number, default: 0, min: 0, max: 100 },
    reading: { type: Number, default: 0, min: 0, max: 100 },
    writing: { type: Number, default: 0, min: 0, max: 100 },
    listening: { type: Number, default: 0 }
  },
  // Günlük kota takibi
  dailyQuotas: {
    date: { type: String, default: "" }, // YYYY-MM-DD
    limits: {
      vocabulary: { type: Number, default: 5 },
      reading: { type: Number, default: 5 },
      writing: { type: Number, default: 5 },
      listening: { type: Number, default: 5 }
    },
    counts: {
      vocabulary: { type: Number, default: 0 },
      reading: { type: Number, default: 0 },
      writing: { type: Number, default: 0 },
      listening: { type: Number, default: 0 }
    }
  },
  // Demografik bilgiler (Anketten toplanan veriler)
  demographics: {
    school: { type: String, default: "" },
    department: { type: String, default: "" },
    profession: { type: String, default: "" }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
