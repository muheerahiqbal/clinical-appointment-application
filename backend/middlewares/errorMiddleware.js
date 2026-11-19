const fs = require('fs');
const path = require('path');

const logsDirectory = path.join(__dirname, '..', 'logs');
const isVercel = process.env.VERCEL === '1';
if (!isVercel) fs.mkdirSync(logsDirectory, { recursive: true });

function notFound(request, response, next) {
  const error = new Error(`Route not found: ${request.method} ${request.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

function errorHandler(error, request, response, next) {
  if (response.headersSent) return next(error);

  let statusCode = error.statusCode || error.status
    || (error.name === 'ValidationError' || error.name === 'CastError' ? 400 : 500);
  if (error.type === 'entity.parse.failed') statusCode = 400;
  let message = statusCode >= 500 ? 'Internal server error' : error.message;
  if (error.code === 11000) {
    statusCode = 409;
    message = 'A record with that value already exists';
  } else if (error.code === 'INVALID_FILE_TYPE') {
    statusCode = 400;
    message = error.message;
  } else if (error.name === 'MulterError') {
    statusCode = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    message = error.code === 'LIMIT_FILE_SIZE' ? 'Uploaded file is too large' : error.message;
  }
  const logEntry = `${new Date().toISOString()} ${request.method} ${request.path} ${statusCode} ${error.stack || error.message}\n`;
  if (isVercel) {
    console.error(logEntry.trimEnd());
  } else {
    fs.appendFile(path.join(logsDirectory, 'error.log'), logEntry, (writeError) => {
      if (writeError) console.error('Unable to write error log:', writeError.message);
    });
  }
  return response.status(statusCode).json({ message });
}

module.exports = { notFound, errorHandler };
