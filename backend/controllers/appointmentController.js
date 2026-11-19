const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const { isAvailableAt, isValidTime } = require('../services/availabilityService');

function parseAppointmentDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10) === value ? date : null;
}

async function bookAppointment(request, response) {
  const { doctorId, date: dateInput, timeSlot, symptoms } = request.body || {};
  const date = parseAppointmentDate(dateInput);
  if (!doctorId || !date || !isValidTime(timeSlot) || typeof symptoms !== 'string'
    || !symptoms.trim() || symptoms.trim().length > 2000) {
    return response.status(400).json({ message: 'A valid doctorId, date (YYYY-MM-DD), timeSlot (HH:mm), and symptoms are required' });
  }
  const now = new Date();
  const requestedTime = date.getTime() + Number(timeSlot.slice(0, 2)) * 60 * 60 * 1000
    + Number(timeSlot.slice(3, 5)) * 60 * 1000;
  if (requestedTime <= now.getTime()) {
    return response.status(400).json({ message: 'Appointments cannot be booked in the past' });
  }

  const doctor = await Doctor.findOne({ _id: doctorId, isApproved: true });
  if (!doctor) return response.status(404).json({ message: 'Verified doctor not found' });
  if (!isAvailableAt(doctor, date, timeSlot)) {
    return response.status(400).json({ message: 'The doctor is not available at that time' });
  }

  const appointment = await Appointment.create({
    patientId: request.user.id,
    doctorId: doctor.id,
    date,
    timeSlot,
    symptoms: symptoms.trim()
  });
  await appointment.populate([
    { path: 'patientId', select: 'name email avatarUrl' },
    {
      path: 'doctorId',
      select: 'specialization experience fees availableSlots isApproved userId',
      populate: { path: 'userId', select: 'name avatarUrl' }
    }
  ]);
  return response.status(201).json({ appointment });
}

async function listMyAppointments(request, response) {
  const page = Math.max(1, Number.parseInt(request.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(request.query.limit, 10) || 20));
  let filter;
  if (request.user.role === 'patient') {
    filter = { patientId: request.user.id };
  } else {
    const doctor = await Doctor.findOne({ userId: request.user.id }).select('_id');
    if (!doctor) return response.status(404).json({ message: 'Doctor profile not found' });
    filter = { doctorId: doctor.id };
  }
  if (request.query.status) {
    if (!['pending', 'approved', 'rejected', 'cancelled'].includes(request.query.status)) {
      return response.status(400).json({ message: 'Invalid appointment status filter' });
    }
    filter.status = request.query.status;
  }

  const [appointments, total] = await Promise.all([
    Appointment.find(filter)
      .populate('patientId', 'name email avatarUrl')
      .populate({
        path: 'doctorId',
        select: 'specialization experience fees availableSlots isApproved userId',
        populate: { path: 'userId', select: 'name avatarUrl' }
      })
      .sort({ date: -1, timeSlot: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Appointment.countDocuments(filter)
  ]);
  return response.json({ appointments, pagination: { page, limit, total } });
}

async function cancelAppointment(request, response) {
  const appointment = await Appointment.findOneAndUpdate(
    { _id: request.params.id, patientId: request.user.id, status: { $in: ['pending', 'approved'] } },
    { $set: { status: 'cancelled' } },
    { new: true, runValidators: true }
  );
  if (!appointment) {
    return response.status(404).json({ message: 'Active appointment not found for this patient' });
  }
  return response.json({ appointment });
}

async function respondToAppointment(request, response) {
  const { status, notes = '' } = request.body || {};
  if (!['approved', 'rejected'].includes(status)) {
    return response.status(400).json({ message: 'Status must be approved or rejected' });
  }
  if (typeof notes !== 'string' || notes.length > 2000) {
    return response.status(400).json({ message: 'Notes must be a string of at most 2000 characters' });
  }

  const doctor = await Doctor.findOne({ userId: request.user.id }).select('_id');
  if (!doctor) return response.status(404).json({ message: 'Doctor profile not found' });
  const appointment = await Appointment.findOneAndUpdate(
    { _id: request.params.id, doctorId: doctor.id, status: 'pending' },
    { $set: { status, notes: notes.trim() } },
    { new: true, runValidators: true }
  ).populate('patientId', 'name email avatarUrl');
  if (!appointment) {
    return response.status(404).json({ message: 'Pending appointment not found for this doctor' });
  }
  return response.json({ appointment });
}

module.exports = { bookAppointment, listMyAppointments, cancelAppointment, respondToAppointment, parseAppointmentDate };
