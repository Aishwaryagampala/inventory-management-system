const pool = require("../db/db");
const getCategoryDistribution = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT category, COUNT(*) AS count
            FROM products
            GROUP BY category`
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching category distribution" });
  }
};

const getlowQuantity = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT sku, name, quantity, reorder_level, 
                CASE
                    WHEN quantity <= reorder_level THEN 'Low Stock'
                    WHEN quantity <= reorder_level + 5 THEN 'Borderline'
                    ELSE 'OK'
                END AS status
            FROM products
            WHERE quantity <= reorder_level + 5`
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error fetching low/borderline stock items" });
  }
};

const getDailyActivityLogs = async (req, res) => {
  const days = Math.max(1, parseInt(req.query.days) || 7);
  try {
    const interval = `${days} days`;
    const result = await pool.query(
      `SELECT 
                DATE(created_at) AS day, 
                COUNT(*) AS total_logs 
            FROM inventory_logs 
            WHERE created_at >= NOW() - INTERVAL '${interval}'
            GROUP BY day 
            ORDER BY day ASC`
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching daily logs" });
  }
};

const getTopSellingProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const result = await pool.query(`
            SELECT 
                    p.sku, 
                    p.name,
                    SUM(il.amount) AS total_quantity_sold
                FROM
                    products p
                JOIN
                    inventory_logs il ON p.sku = il.sku
                WHERE 
                    il.action = 'sale'
                GROUP BY
                    p.sku, p.name
                ORDER BY
                    total_quantity_sold DESC
                LIMIT 10;   
            `);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching top selling products:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getCategoryDistribution,
  getlowQuantity,
  getDailyActivityLogs,
  getTopSellingProducts,
};
