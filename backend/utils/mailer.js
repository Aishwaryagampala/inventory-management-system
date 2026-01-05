const pool = require("../db/db");

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.MAIL_PROVIDER_KEY) {
    console.log("[MAIL:DEV]", { to, subject });
    console.log(html);
    return;
  }

  console.warn(
    "sendEmail is configured with MAIL_PROVIDER_KEY, but no provider SDK is wired up yet."
  );
};

const getAvgDailySales = async (sku) => {
  const query = `
        SELECT 
            SUM(amount) / GREATEST(DATE_PART('day', MAX(created_at) - MIN(created_at)), 1) AS avg_daily_sales
        FROM inventory_logs
        WHERE action = 'sale' AND sku = $1 AND created_at >= NOW() - INTERVAL '30 days'
    `;
  const result = await pool.query(query, [sku]);
  return result.rows[0].avg_daily_sales || 1;
};

const getAdminEmails = async () => {
  try {
    const result = await pool.query(
      "SELECT email FROM users WHERE user_role = 'admin'"
    );
    return result.rows.map((row) => row.email);
  } catch (err) {
    console.error("Failed to fetch admin emails:", err);
    return [];
  }
};

const sendLowStockAlert = async (product) => {
  try {
    const avgDailySales = await getAvgDailySales(product.sku);
    const leadTime = 5;
    const suggestedQty = Math.ceil(avgDailySales * leadTime);

    const adminEmails = await getAdminEmails();
    if (adminEmails.length === 0) return;

    await sendEmail({
      to: adminEmails,
      subject: `Low Stock Alert: ${product.name}`,
      html: `
                <h2>Product Running Low!</h2>
                <p><strong>Product:</strong> ${product.name}</p>
                <p><strong>SKU:</strong> ${product.sku}</p>
                <p><strong>Current Quantity:</strong> ${product.quantity}</p>
                <p><strong>Reorder Level:</strong> ${product.reorder_level}</p>
                <p><strong>Suggested Order Quantity:</strong> ${suggestedQty}</p>
            `,
    });

    console.log(`Low stock email queued for: ${adminEmails.join(", ")}`);
  } catch (err) {
    console.error("Error sending email alert:", err);
  }
};

module.exports = { sendLowStockAlert };
