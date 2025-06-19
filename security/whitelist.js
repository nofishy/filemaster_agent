const fs = require('fs');
const path = require('path');

/**
 * Checks if a file path is within the whitelisted directories.
 * @param {string} filePath The file path to check.
 * @param {string} configPath The path to the security configuration file.
 * @returns {boolean} True if the path is whitelisted, false otherwise.
 */
function isPathWhitelisted(filePath, configPath) {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const whitelistedDirectories = config.whitelistedDirectories || [];

    const absoluteFilePath = path.resolve(filePath);

    for (const whitelistedDir of whitelistedDirectories) {
      const absoluteWhitelistedDir = path.resolve(whitelistedDir);
      if (absoluteFilePath.startsWith(absoluteWhitelistedDir)) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Error reading or parsing security configuration:', error);
    return false; // Default to denying access on configuration errors
  }
}

module.exports = {
  isPathWhitelisted,
};
