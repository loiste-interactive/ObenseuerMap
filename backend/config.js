require('dotenv').config();

module.exports = {
  database: {
    host: process.env.DB_HOST,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS
  },
  server: {
    port: process.env.PORT || 5551
  },
  jwt: {
    secret: process.env.JWT_SECRET
  }
};