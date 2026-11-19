const { cloudinary, configureCloudinary } = require('../config/cloudinary');

async function uploadToCloudinary(file, folder) {
  configureCloudinary();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({
      folder: `clinic-appointments/${folder}`,
      resource_type: 'auto'
    }, (error, result) => {
      if (error) return reject(error);
      return resolve({
        url: result.secure_url,
        publicId: result.public_id,
        resourceType: result.resource_type
      });
    });
    stream.end(file.buffer);
  });
}

async function removeFromCloudinary(publicId, resourceType = 'image') {
  if (!publicId) return;
  configureCloudinary();
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

module.exports = { uploadToCloudinary, removeFromCloudinary };
