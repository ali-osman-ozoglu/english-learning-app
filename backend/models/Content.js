const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['word', 'sentence', 'paragraph'], 
    required: true 
  },
  level: { 
    type: String, 
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'], 
    required: true 
  },
  englishText: { type: String, required: true },
  turkishTranslations: [{ type: String, required: true }],
  wordType: { type: String }, // 'verb', 'noun', 'adjective', 'adverb', 'preposition', 'conjunction' vs.
  
  // Öncelik Sırası (Priority)
  // 0 = Pasif (kullanıcıya gösterilmez)
  // 1 = Varsayılan, normal öncelik
  // 5 = En yüksek öncelik (ilk gösterilecekler)
  priority: { 
    type: Number, 
    min: 0, 
    max: 5, 
    default: 1 
  }
}, { timestamps: true });

module.exports = mongoose.model('Content', contentSchema);
