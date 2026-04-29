require('dotenv').config();
const mongoose = require('mongoose');
const Content = require('./models/Content');

async function test() {
  await mongoose.connect('mongodb://localhost:27017/english-learning-app');
  try {
    const c = new Content({
      type: 'word',
      level: 'A1',
      englishText: 'Test',
      turkishTranslation: 'Test',
      priority: 1
    });
    await c.save();
    console.log('Saved successfully');
  } catch(e) {
    console.error('Error saving:', e);
  }
  mongoose.disconnect();
}
test();
