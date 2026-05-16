const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminUserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: Number,
        enum: [1, 2, 3, 4, 5],
        default: 5 // 1: Süper Admin, 5: En kısıtlı yetki
    }
}, { timestamps: true });

// Şifreyi kaydetmeden önce hash'le
adminUserSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// Şifre karşılaştırma metodu
adminUserSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('AdminUser', adminUserSchema);
