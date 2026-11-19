const fs = require('fs');
const path = require('path');

const logsDirectory = path.join(__dirname, '..', 'logs');

function logAudit(action, actorId, targetId) {
  const entry = JSON.stringify({
    timestamp: new Date().toISOString(),
    action,
    actorId: String(actorId),
    targetId: String(targetId)
  }) + '\n';
  fs.appendFile(path.join(logsDirectory, 'audit.log'), entry, (error) => {
    if (error) console.error('Unable to write audit log:', error.message);
  });
}

module.exports = logAudit;
