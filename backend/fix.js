const mongoose = require('mongoose');
const User = require('./models/User');

async function fixUsers() {
  await mongoose.connect('mongodb://localhost:27017/english-learning-app');
  const result = await User.updateMany(
    { 'dailyQuotas.limits.vocabulary': 0 },
    { $set: {
      'dailyQuotas.limits.vocabulary': 5,
      'dailyQuotas.limits.reading': 5,
      'dailyQuotas.limits.writing': 5,
      'dailyQuotas.limits.listening': 5
    }}
  );
  console.log('Fixed users:', result);
  process.exit(0);
}
fixUsers();
