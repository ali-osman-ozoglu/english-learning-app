const mongoose = require('mongoose');
const User = require('../models/User');

async function resetUsers() {
    try {
        await mongoose.connect('mongodb://localhost:27017/english-learning-app');
        const result = await User.updateMany({}, { 
            $set: { 
                'level.vocabulary': 'UNTESTED',
                'level.reading': 'UNTESTED',
                'level.writing': 'UNTESTED',
                'level.listening': 'UNTESTED'
            } 
        });
        console.log(`Successfully reset ${result.modifiedCount} users to UNTESTED status.`);
        process.exit(0);
    } catch (err) {
        console.error('Reset failed:', err);
        process.exit(1);
    }
}

resetUsers();
