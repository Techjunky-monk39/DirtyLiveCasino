// Simple logger utility for backend
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'pitboss.log');

function log(message) {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] ${message}\n`;
  fs.appendFile(logFile, entry, err => {
    if (err) console.error('Failed to write log:', err);
  });
  if (process.env.NODE_ENV !== 'production') {
    console.log(entry.trim());
  }
}

function logError(error, context = '') {
  const msg = `ERROR${context ? ' (' + context + ')' : ''}: ${error.stack || error}`;
  log(msg);
}

module.exports = { log, logError };
