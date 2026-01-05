const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db/db");
require("dotenv").config();

const login = async (req, res) => {
  const { email, password, rememberMe } = req.body;
  console.log("Login attempt:", email);

  try {
    const result = await pool.query(
      "SELECT user_id, username, email, password_hashed AS password, user_role FROM users WHERE email = $1",
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      console.warn("No user found with email:", email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.warn("Invalid password for email:", email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing!");
      return res.status(500).json({ message: "Server misconfiguration" });
    }

    const token = jwt.sign(
      { id: user.user_id, role: user.user_role },
      process.env.JWT_SECRET,
      { expiresIn: rememberMe ? "30d" : "1h" }
    );

    res.cookie(process.env.COOKIE_NAME, token, {
      httpOnly: true,
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000,
      secure: false,
      sameSite: "lax",
    });

    console.log("Login success, token generated");

    res
      .status(200)
      .json({ message: "Logged in successfully", role: user.user_role });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login error", error: err.message });
  }
};

const logout = (req, res) => {
  res
    .clearCookie(process.env.COOKIE_NAME, {
      httpOnly: true,
      sameSite: "Strict",
      secure: process.env.NODE_ENV === "production",
    })
    .status(200)
    .json({ message: "Logged out successfully" });
};

const session = (req, res) => {
  const token = req.cookies[process.env.COOKIE_NAME];

  if (!token) {
    return res.status(401).json({ loggedIn: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({
      loggedIn: true,
      role: decoded.role,
      userId: decoded.id,
    });
  } catch (err) {
    res.status(401).json({ loggedIn: false });
  }
};

module.exports = {
  login,
  logout,
  session,
};
