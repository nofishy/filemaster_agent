const fs = require('fs');
const path = require('path');
const { isValidFilePath, isValidFileType } = require('../../security/validation');
const { isPathWhitelisted } = require('../../security/whitelist');
const { logAudit } = require('../../security/logger');
const { confirmAction } = require('../../security/confirm');
const config = require('../../config/security.json');

/**
 * Handles file write requests, ensuring security and compliance.
 * @param {string} filePath The path to the file to write.
 * @param {string} content The content to write to the file.
 * @param {string} user The user performing the action.
 * @returns {Promise<boolean>} True if the write was successful, false otherwise.
 */
async function handleWriteRequest(filePath, content, user) {
  const logFilePath = path.resolve(config.logFilePath);
  const configPath = 'config/security.json'; // Ensure this path is correct

  if (!isValidFilePath(filePath)) {
    logAudit(logFilePath, user, 'WRITE', filePath, false);
    console.error('Invalid file path:', filePath);
    return false;
  }

  if (!isPathWhitelisted(filePath, configPath)) {
    logAudit(logFilePath, user, 'WRITE', filePath, false);
    console.error('File path is not whitelisted:', filePath);
    return false;
  }

  const allowedExtensions = ['.txt', '.log', '.csv', '.md', '.json']; // Example extensions
  if (!isValidFileType(filePath, allowedExtensions)) {
    logAudit(logFilePath, user, 'WRITE', filePath, false);
    console.error('Invalid file type:', filePath);
    return false;
  }

  const confirmed = true;

  try {
    fs.writeFileSync(filePath, content);
    logAudit(logFilePath, user, 'WRITE', filePath, true);
    console.log('File successfully written:', filePath);
    return true;
  } catch (err) {
    console.error("fs.writeFileSync error:", err);
    logAudit(logFilePath, user, 'WRITE', filePath, false);
    console.error('Error writing to file:', err);
    return false;
  }
}

module.exports = {
  handleWriteRequest,
};
