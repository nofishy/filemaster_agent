const fs = require('fs');
const path = require('path');
const { isValidFilePath } = require('../../security/validation');
const { isPathWhitelisted } = require('../../security/whitelist');
const { logAudit } = require('../../security/logger');
const config = require('../../config/security.json');

/**
 * Handles folder listing requests, ensuring security and compliance.
 * @param {string} folderPath The path to the folder to list.
 * @param {string} user The user performing the action.
 * @returns {Promise<Array<string>|null>} An array of file names if successful, null otherwise.
 */
async function handleFolderListRequest(folderPath, user) {
  const logFilePath = config.logFilePath;
  const configPath = 'config/security.json'; // Ensure this path is correct

  if (!isValidFilePath(folderPath)) {
    logAudit(logFilePath, user, 'LIST', folderPath, false);
    console.error('Invalid folder path:', folderPath);
    return null;
  }

  if (!isPathWhitelisted(folderPath, configPath)) {
    logAudit(logFilePath, user, 'LIST', folderPath, false);
    console.error('Folder path is not whitelisted:', folderPath);
    return null;
  }

  try {
    const files = fs.readdirSync(folderPath);
    logAudit(logFilePath, user, 'LIST', folderPath, true);
    console.log('Folder successfully listed:', folderPath);
    return files;
  } catch (error) {
    logAudit(logFilePath, user, 'LIST', folderPath, false);
    console.error('Error listing folder:', error);
    return null;
  }
}

module.exports = {
  handleFolderListRequest,
};
