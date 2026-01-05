const pool = require("../db/db");
const nodemailer = require("nodemailer");

// Track recent alerts to prevent spam (SKU -> timestamp)
const recentAlerts = new Map();
const COOLDOWN_MINUTES = 60; // Don't send same alert within 60 minutes

const sendEmail = async ({ to, subject, html }) => {
  // Development mode - just log to console
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("[MAIL:DEV]", { to, subject });
    console.log(html);
    return;
  }

  try {
    // Create transporter with SMTP configuration
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT) || 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send email
    const info = await transporter.sendMail({
      from: `"IMS Alert" <${process.env.EMAIL_USER}>`,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject,
      html,
    });

    console.log(`[MAIL:SENT] Message sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("[MAIL:ERROR] Failed to send email:", error.message);
    // Don't throw - allow application to continue even if email fails
  }
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
    // Check cooldown to prevent spam
    const lastAlert = recentAlerts.get(product.sku);
    const now = Date.now();

    if (lastAlert && now - lastAlert < COOLDOWN_MINUTES * 60 * 1000) {
      console.log(
        `[MAIL:COOLDOWN] Skipping alert for ${product.sku} - sent ${Math.round(
          (now - lastAlert) / 60000
        )} minutes ago`
      );
      return;
    }

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

    // Update last alert timestamp
    recentAlerts.set(product.sku, now);
    console.log(`Low stock email queued for: ${adminEmails.join(", ")}`);
  } catch (err) {
    console.error("Error sending email alert:", err);
  }
};

module.exports = { sendLowStockAlert };
