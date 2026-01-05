require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});

const pwd = process.env.DB_PASSWORD;
if (typeof pwd !== "string" || pwd.length === 0) {
  console.error("DB_PASSWORD must be a non-empty string in backend/.env");
  process.exit(1);
}

const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

module.exports = pool;
