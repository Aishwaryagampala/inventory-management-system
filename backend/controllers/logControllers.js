const pool = require("../db/db");

const createLog = async (sku, action, amount, user_id) => {
  try {
    await pool.query(
      "INSERT INTO inventory_logs (sku, action, amount, user_id) VALUES ($1, $2, $3, $4)",
      [sku, action, amount, user_id]
    );
  } catch (err) {
    console.error("Log error", err);
  }
};

const getAllLogs = async (req, res) => {
  const { sku, action, user, start_date, end_date } = req.query;
  let query = `
        SELECT inventory_logs.*, users.username AS user 
        FROM inventory_logs
        JOIN users ON inventory_logs.user_id = users.user_id 
        WHERE 1=1
    `;
  const params = [];
  let idx = 1;

  if (sku) {
    query += ` AND inventory_logs.sku ILIKE $${idx++}`;
    params.push(`%${sku}%`);
  }

  if (action) {
    query += ` AND inventory_logs.action ILIKE $${idx++}`;
    params.push(`%${action}%`);
  }

  if (user) {
    query += ` AND users.username ILIKE $${idx++}`;
    params.push(`%${user}%`);
  }

  if (start_date && end_date) {
    query += ` AND inventory_logs.created_at BETWEEN $${idx++} AND $${idx++}`;
    params.push(start_date, end_date);
  } else if (start_date) {
    query += ` AND inventory_logs.created_at >= $${idx++}`;
    params.push(start_date);
  } else if (end_date) {
    query += ` AND inventory_logs.created_at <= $${idx++}`;
    params.push(end_date);
  }

  query += ` ORDER BY inventory_logs.created_at DESC`;

  try {
    const result = await pool.query(query, params);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching logs: ", err);
    res.status(500).json({ message: "Error fetching logs" });
  }
};

const deleteLog = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM inventory_logs WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Log not found" });
    }

    res.status(200).json({ message: "Log deleted successfully" });
  } catch (err) {
    console.error("Error deleting log: ", err);
    res.status(500).json({ message: "Error deleting log" });
  }
};

module.exports = { getAllLogs, createLog, deleteLog };
