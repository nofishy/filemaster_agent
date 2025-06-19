const fs = require('fs');
const path = require('path');

/**
 * Logs an audit entry to the audit log file.
 * @param {string} logFilePath The path to the audit log file.
 * @param {string} user The user performing the action.
 * @param {string} operation The operation being performed.
 * @param {string} filePath The file path being accessed.
 * @param {boolean} success Whether the operation was successful.
 */
function logAudit(logFilePath, user, operation, filePath, success) {
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} - User: ${user}, Operation: ${operation}, File: ${filePath}, Success: ${success}\n`;

  fs.appendFile(path.resolve(logFilePath), logEntry, (err) => {
    if (err) {
      console.error('Error writing to audit log:', err);
    }
  });
}

module.exports = {
  logAudit,
};
