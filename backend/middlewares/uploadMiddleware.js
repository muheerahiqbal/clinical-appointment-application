const multer = require('multer');

const imageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const documentTypes = new Set([...imageTypes, 'application/pdf']);
const maxBytes = Number.parseInt(process.env.UPLOAD_MAX_BYTES || '5242880', 10);

function createUpload(allowedTypes) {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: Number.isFinite(maxBytes) && maxBytes > 0 ? maxBytes : 5242880, files: 1 },
    fileFilter(request, file, callback) {
      if (!allowedTypes.has(file.mimetype)) {
        const error = new Error(allowedTypes === imageTypes
          ? 'Only JPEG, PNG, and WebP images are allowed'
          : 'Only JPEG, PNG, WebP images and PDF files are allowed');
        error.code = 'INVALID_FILE_TYPE';
        return callback(error);
      }
      return callback(null, true);
    }
  });
}

const upload = createUpload(imageTypes);
upload.document = createUpload(documentTypes);

module.exports = upload;
