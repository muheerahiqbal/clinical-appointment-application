const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
    index: true
  },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
  symptoms: { type: String, required: true, trim: true, maxlength: 2000 },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending',
    index: true
  },
  notes: { type: String, default: '', trim: true, maxlength: 2000 }
}, { timestamps: true });

appointmentSchema.index({ patientId: 1, date: -1 });
appointmentSchema.index({ doctorId: 1, date: 1, status: 1 });
appointmentSchema.index(
  { doctorId: 1, date: 1, timeSlot: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['pending', 'approved'] } }
  }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
