const fs = require('fs');
const path = require('path');
const { isValidFilePath, isValidFileType } = require('../../security/validation');
const { isPathWhitelisted } = require('../../security/whitelist');
const { logAudit } = require('../../security/logger');
const config = require('../../config/security.json');

/**
 * Handles file read requests, ensuring security and compliance.
 * @param {string} filePath The path to the file to read.
 * @param {string} user The user performing the action.
 * @returns {Promise<string|null>} The file content if the read was successful, null otherwise.
 */
async function handleReadRequest(filePath, user) {
  const logFilePath = config.logFilePath;
  const configPath = 'config/security.json'; // Ensure this path is correct

  if (!isValidFilePath(filePath)) {
    logAudit(logFilePath, user, 'READ', filePath, false);
    console.error('Invalid file path:', filePath);
    return null;
  }

  if (!isPathWhitelisted(filePath, configPath)) {
    logAudit(logFilePath, user, 'READ', filePath, false);
    console.error('File path is not whitelisted:', filePath);
    return null;
  }

  const allowedExtensions = ['.txt', '.log', '.csv', '.md', '.json']; // Example extensions
  if (!isValidFileType(filePath, allowedExtensions)) {
    logAudit(logFilePath, user, 'READ', filePath, false);
    console.error('Invalid file type:', filePath);
    return null;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    logAudit(logFilePath, user, 'READ', filePath, true);
    console.log('File successfully read:', filePath);
    return content;
  } catch (error) {
    logAudit(logFilePath, user, 'READ', filePath, false);
    console.error('Error reading file:', error);
    return null;
  }
}

module.exports = {
  handleReadRequest,
};
