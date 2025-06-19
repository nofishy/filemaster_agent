const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * Prompts the user for confirmation before proceeding with an action.
 * @param {string} message The message to display to the user.
 * @returns {Promise<boolean>} True if the user confirms, false otherwise.
 */
function confirmAction(message) {
  return new Promise((resolve) => {
    readline.question(`${message} (y/n) `, (answer) => {
      const confirmed = answer.toLowerCase() === 'y';
      resolve(confirmed);
      readline.close();
    });
  });
}

module.exports = {
  confirmAction,
};
