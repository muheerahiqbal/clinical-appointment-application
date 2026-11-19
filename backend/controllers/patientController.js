const { uploadToCloudinary, removeFromCloudinary } = require('../utils/cloudinaryUpload');

async function updateAvatar(request, response) {
  if (!request.file) {
    return response.status(400).json({ message: 'An avatar image is required' });
  }
  const uploaded = await uploadToCloudinary(request.file, 'avatars');
  request.user.avatarUrl = uploaded.url;
  try {
    await request.user.save();
  } catch (error) {
    await removeFromCloudinary(uploaded.publicId);
    throw error;
  }
  return response.json({ user: request.user });
}

async function updateProfile(request, response) {
  const { name } = request.body || {};
  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
      return response.status(400).json({ message: 'Name must be between 2 and 100 characters' });
    }
    request.user.name = name.trim();
  }
  await request.user.save();
  return response.json({ user: request.user });
}

module.exports = { updateAvatar, updateProfile };
