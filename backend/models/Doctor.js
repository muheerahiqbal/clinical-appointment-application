const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  dayOfWeek: { type: Number, min: 0, max: 6, required: true },
  startTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
  endTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ }
}, { _id: false });

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  specialization: { type: String, required: true, trim: true, maxlength: 100 },
  experience: { type: Number, required: true, min: 0, max: 80 },
  fees: { type: Number, required: true, min: 0, max: 100000 },
  certificateUrl: { type: String, default: null, maxlength: 2048 },
  isApproved: { type: Boolean, default: false, index: true },
  slotDurationMinutes: { type: Number, default: 30, min: 10, max: 240 },
  availableSlots: { type: [availabilitySchema], default: [] }
}, { timestamps: true });

doctorSchema.index({ isApproved: 1, specialization: 1 });

doctorSchema.pre('validate', function validateAvailability() {
  for (const slot of this.availableSlots) {
    if (slot.startTime >= slot.endTime) {
      this.invalidate('availableSlots', 'Availability end time must be after start time');
      break;
    }
  }
});

module.exports = mongoose.model('Doctor', doctorSchema);
