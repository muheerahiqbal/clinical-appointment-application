const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const logAudit = require('../utils/auditLogger');

async function listDoctors(request, response) {
  const { approved, page = '1', limit = '20' } = request.query;
  const pageNumber = Math.max(1, Number.parseInt(page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 20));
  const filter = {};
  if (approved === 'true') filter.isApproved = true;
  if (approved === 'false') filter.isApproved = false;
  const [doctors, total] = await Promise.all([
    Doctor.find(filter).populate('userId', 'name email avatarUrl').sort({ createdAt: -1 })
      .skip((pageNumber - 1) * pageSize).limit(pageSize),
    Doctor.countDocuments(filter)
  ]);
  return response.json({ doctors, pagination: { page: pageNumber, limit: pageSize, total } });
}

async function verifyDoctor(request, response) {
  const { approved } = request.body || {};
  if (typeof approved !== 'boolean') {
    return response.status(400).json({ message: 'approved must be a boolean' });
  }
  const doctor = await Doctor.findByIdAndUpdate(
    request.params.id,
    { $set: { isApproved: approved } },
    { new: true, runValidators: true }
  ).populate('userId', 'name email');
  if (!doctor) return response.status(404).json({ message: 'Doctor not found' });
  logAudit(approved ? 'doctor.approved' : 'doctor.unapproved', request.user.id, doctor.id);
  return response.json({ doctor });
}

async function listPatients(request, response) {
  const page = Math.max(1, Number.parseInt(request.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(request.query.limit, 10) || 20));
  const [patients, total] = await Promise.all([
    User.find({ role: 'patient' }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments({ role: 'patient' })
  ]);
  return response.json({ patients, pagination: { page, limit, total } });
}

async function deletePatient(request, response) {
  const patient = await User.findOne({ _id: request.params.id, role: 'patient' });
  if (!patient) return response.status(404).json({ message: 'Patient not found' });
  await Appointment.deleteMany({ patientId: patient.id });
  await User.deleteOne({ _id: patient.id, role: 'patient' });
  logAudit('patient.deleted', request.user.id, patient.id);
  return response.status(204).end();
}

async function deleteDoctor(request, response) {
  const doctor = await Doctor.findById(request.params.id);
  if (!doctor) return response.status(404).json({ message: 'Doctor not found' });
  await Appointment.deleteMany({ doctorId: doctor.id });
  await Doctor.deleteOne({ _id: doctor.id });
  await User.deleteOne({ _id: doctor.userId, role: 'doctor' });
  logAudit('doctor.deleted', request.user.id, doctor.id);
  return response.status(204).end();
}

async function listAppointments(request, response) {
  const page = Math.max(1, Number.parseInt(request.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(request.query.limit, 10) || 20));
  const filter = {};
  if (request.query.status) {
    if (!['pending', 'approved', 'rejected', 'cancelled'].includes(request.query.status)) {
      return response.status(400).json({ message: 'Invalid appointment status filter' });
    }
    filter.status = request.query.status;
  }
  const [appointments, total] = await Promise.all([
    Appointment.find(filter)
      .populate('patientId', 'name email')
      .populate({
        path: 'doctorId',
        select: 'specialization experience fees certificateUrl availableSlots isApproved userId',
        populate: { path: 'userId', select: 'name email' }
      })
      .sort({ date: -1, timeSlot: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Appointment.countDocuments(filter)
  ]);
  return response.json({ appointments, pagination: { page, limit, total } });
}

async function getStatistics(request, response) {
  const [patients, doctors, pendingDoctors, appointmentsByStatus] = await Promise.all([
    User.countDocuments({ role: 'patient' }),
    Doctor.countDocuments(),
    Doctor.countDocuments({ isApproved: false }),
    Appointment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { _id: 0, status: '$_id', count: 1 } }
    ])
  ]);
  return response.json({
    statistics: {
      patients,
      doctors,
      pendingDoctors,
      appointments: appointmentsByStatus.reduce((result, item) => {
        result[item.status] = item.count;
        return result;
      }, { pending: 0, approved: 0, rejected: 0, cancelled: 0 })
    }
  });
}

module.exports = {
  listDoctors,
  verifyDoctor,
  listPatients,
  deletePatient,
  deleteDoctor,
  listAppointments,
  getStatistics
};
