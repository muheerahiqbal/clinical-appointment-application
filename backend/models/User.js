const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 254,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    type: String,
    required: true,
    minlength: 12,
    validate: {
      validator: (value) => Buffer.byteLength(value, 'utf8') <= 72,
      message: 'Password must be at most 72 bytes'
    },
    select: false
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    required: true,
    immutable: true
  },
  avatarUrl: {
    type: String,
    default: null,
    maxlength: 2048
  }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

userSchema.index({ role: 1, createdAt: -1 });

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function toJSON() {
  const value = this.toObject();
  delete value.password;
  delete value.__v;
  return value;
};

module.exports = mongoose.model('User', userSchema);
