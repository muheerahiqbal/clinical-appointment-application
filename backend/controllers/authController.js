const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const { uploadToCloudinary, removeFromCloudinary } = require('../utils/cloudinaryUpload');

const isProduction = process.env.NODE_ENV === 'production';

function getTokenLifetime() {
  const expiresIn = process.env.JWT_EXPIRES_IN || '1d';
  const match = /^([1-9]\d*)(s|m|h|d)$/.exec(expiresIn);
  if (!match) throw new Error('JWT_EXPIRES_IN must be a positive number followed by s, m, h, or d');
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  const maxAge = Number(match[1]) * multipliers[match[2]];
  if (!Number.isSafeInteger(maxAge)) throw new Error('JWT_EXPIRES_IN is too large');
  return { expiresIn, maxAge };
}

const cookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === 'true' || isProduction,
  // Separate Vercel frontend and API origins require cross-site cookies in production.
  sameSite: isProduction ? 'none' : 'strict',
  ...(maxAge ? { maxAge } : {}),
  path: '/'
});

function issueToken(user, response) {
  const lifetime = getTokenLifetime();
  const token = jwt.sign(
    { sub: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: lifetime.expiresIn, issuer: 'clinic-appointment-api' }
  );
  response.cookie('token', token, cookieOptions(lifetime.maxAge));
  return token;
}

async function register(request, response) {
  const { name, email, password, role = 'patient' } = request.body || {};
  if (!name || !email || !password) {
    return response.status(400).json({ message: 'Name, email, and password are required' });
  }
  if (!['patient', 'doctor'].includes(role)) {
    return response.status(400).json({ message: 'Only patient and doctor accounts can be registered' });
  }
  if (typeof password !== 'string' || password.length < 12 || Buffer.byteLength(password, 'utf8') > 72) {
    return response.status(400).json({ message: 'Password must be at least 12 characters and at most 72 bytes' });
  }

  let uploaded;
  let user;
  try {
    if (role === 'doctor') {
      const { specialization, experience, fees } = request.body;
      if (!specialization || experience === undefined || fees === undefined) {
        return response.status(400).json({ message: 'Doctor registration requires specialization, experience, and fees' });
      }
      if (request.file) uploaded = await uploadToCloudinary(request.file, 'certificates');
    }
    user = await User.create({ name, email, password, role });
    if (role === 'doctor') {
      await Doctor.create({
        userId: user.id,
        specialization: request.body.specialization,
        experience: request.body.experience,
        fees: request.body.fees,
        certificateUrl: uploaded ? uploaded.url : null
      });
    }
    const token = issueToken(user, response);
    return response.status(201).json({ user, token });
  } catch (error) {
    if (user) {
      await Promise.all([
        Doctor.deleteOne({ userId: user.id }),
        User.deleteOne({ _id: user.id })
      ]);
    }
    if (uploaded) {
      try {
        await removeFromCloudinary(uploaded.publicId, uploaded.resourceType);
      } catch (cleanupError) {
        console.error('Unable to remove orphaned Cloudinary upload:', cleanupError.message);
      }
    }
    throw error;
  }
}

async function login(request, response) {
  const { email, password } = request.body || {};
  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    return response.status(400).json({ message: 'Email and password are required' });
  }
  if (Buffer.byteLength(password, 'utf8') > 72) {
    return response.status(400).json({ message: 'Password must be at most 72 bytes' });
  }

  const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return response.status(401).json({ message: 'Invalid email or password' });
  }
  const token = issueToken(user, response);
  return response.json({ user, token });
}

function logout(request, response) {
  response.clearCookie('token', cookieOptions());
  return response.status(204).end();
}

function currentUser(request, response) {
  return response.json({ user: request.user });
}

module.exports = { register, login, logout, currentUser };
