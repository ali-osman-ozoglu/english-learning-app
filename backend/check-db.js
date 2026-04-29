const mongoose = require('mongoose');
const Content = require('./models/Content');

async function check() {
    await mongoose.connect('mongodb://localhost:27017/english-learning-app');
    const counts = await Content.aggregate([
        { $group: { _id: { type: '$type', level: '$level' }, count: { $sum: 1 } } }
    ]);
    console.log(JSON.stringify(counts, null, 2));
    process.exit();
}

check();
