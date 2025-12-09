const CryptoJS = require('crypto-js');
const crypto = require('crypto');
const config = require('../config');

// Encrypt data
const encrypt = (data) => {
  if (!data) return null;
  const stringData = typeof data === 'string' ? data : JSON.stringify(data);
  return CryptoJS.AES.encrypt(stringData, config.ENCRYPTION_KEY).toString();
};

// Decrypt data
const decrypt = (encryptedData) => {
  if (!encryptedData) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, config.ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    try {
      return JSON.parse(decrypted);
    } catch {
      return decrypted;
    }
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

// Generate random token
const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Generate OTP
const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

// Hash data (one-way)
const hash = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

// Compare hash
const compareHash = (data, hashedData) => {
  return hash(data) === hashedData;
};

// Generate secure random string
const generateSecureString = (length = 16) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars[randomBytes[i] % chars.length];
  }
  return result;
};

module.exports = {
  encrypt,
  decrypt,
  generateToken,
  generateOTP,
  hash,
  compareHash,
  generateSecureString,
};
