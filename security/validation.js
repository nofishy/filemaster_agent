/**
 * Validates a file path to prevent malicious activities.
 * @param {string} filePath The file path to validate.
 * @returns {boolean} True if the path is valid, false otherwise.
 */
function isValidFilePath(filePath) {
  // Basic path sanitization to prevent path traversal
  if (filePath.includes('..')) {
    return false;
  }

  // Check for special characters
  const specialChars = /[<>:"|?*]/;
  if (specialChars.test(filePath)) {
    return false;
  }

  return true;
}

/**
 * Validates the file type based on its extension.
 * @param {string} filePath The file path to check.
 * @param {Array<string>} allowedExtensions An array of allowed file extensions.
 * @returns {boolean} True if the file type is allowed, false otherwise.
 */
function isValidFileType(filePath, allowedExtensions) {
  const lastDotIndex = filePath.lastIndexOf(".");
  if (lastDotIndex === -1) {
    return false; // No extension found
  }
  const fileExtension = filePath.slice(lastDotIndex); // Includes the dot
  return allowedExtensions.includes(fileExtension);
}

module.exports = {
  isValidFilePath,
  isValidFileType,
};
