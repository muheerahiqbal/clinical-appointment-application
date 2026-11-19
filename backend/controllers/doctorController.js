const Doctor = require('../models/Doctor');
const { uploadToCloudinary, removeFromCloudinary } = require('../utils/cloudinaryUpload');

async function listVerifiedDoctors(request, response) {
  const { specialization, page = '1', limit = '20' } = request.query;
  const pageNumber = Math.max(1, Number.parseInt(page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 20));
  const filter = { isApproved: true };
  if (specialization) filter.specialization = new RegExp(String(specialization).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

  const [doctors, total] = await Promise.all([
    Doctor.find(filter).select('-certificateUrl').populate('userId', 'name avatarUrl').sort({ specialization: 1 }).skip((pageNumber - 1) * pageSize).limit(pageSize),
    Doctor.countDocuments(filter)
  ]);
  return response.json({ doctors, pagination: { page: pageNumber, limit: pageSize, total } });
}

async function getDoctor(request, response) {
  const doctor = await Doctor.findOne({ _id: request.params.id, isApproved: true }).select('-certificateUrl')
    .populate('userId', 'name avatarUrl');
  if (!doctor) return response.status(404).json({ message: 'Verified doctor not found' });
  return response.json({ doctor });
}

async function getMyProfile(request, response) {
  const doctor = await Doctor.findOne({ userId: request.user.id }).populate('userId', 'name email avatarUrl');
  if (!doctor) return response.status(404).json({ message: 'Doctor profile not found' });
  return response.json({ doctor });
}

async function updateMyProfile(request, response) {
  const doctor = await Doctor.findOne({ userId: request.user.id });
  if (!doctor) return response.status(404).json({ message: 'Doctor profile not found' });

  const { name, specialization, experience, fees, slotDurationMinutes, availableSlots } = request.body || {};
  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
      return response.status(400).json({ message: 'Name must be between 2 and 100 characters' });
    }
    request.user.name = name.trim();
  }
  if (specialization !== undefined) doctor.specialization = specialization;
  if (experience !== undefined) doctor.experience = experience;
  if (fees !== undefined) doctor.fees = fees;
  if (slotDurationMinutes !== undefined) doctor.slotDurationMinutes = slotDurationMinutes;
  if (availableSlots !== undefined) doctor.availableSlots = availableSlots;

  let uploaded;
  if (request.file) {
    uploaded = await uploadToCloudinary(request.file, 'certificates');
    doctor.certificateUrl = uploaded.url;
  }
  try {
    await doctor.validate();
    if (name !== undefined) await request.user.save();
    await doctor.save();
  } catch (error) {
    if (uploaded) {
      try {
        await removeFromCloudinary(uploaded.publicId, uploaded.resourceType);
      } catch (cleanupError) {
        console.error('Unable to remove orphaned Cloudinary upload:', cleanupError.message);
      }
    }
    throw error;
  }
  return response.json({ doctor });
}

module.exports = { listVerifiedDoctors, getDoctor, getMyProfile, updateMyProfile };
