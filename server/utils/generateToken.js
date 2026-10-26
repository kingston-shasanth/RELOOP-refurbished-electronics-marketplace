const jwt = require('jsonwebtoken');

const generateToken = (id, role = 'customer') => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'reloop_jwt_secret_key_2026', {
    expiresIn: '7d',
  });
};

module.exports = generateToken;
