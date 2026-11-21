const jwt = require('jsonwebtoken');

const generateToken = (userId, role = 'candidate') => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'talenthub_default_secret_key_change_me',
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    }
  );
};

module.exports = generateToken;
