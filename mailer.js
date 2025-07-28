const nodemailer = require('nodemailer');
const pool = require('../config/db');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true, 
    auth: {
        user: process.env.EMAIL_USER,      
        pass: process.env.EMAIL_PASS       
    }
});

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
        return result.rows.map(row => row.email);
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

        const mailOptions = {
            from: process.env.EMAIL_USER_USER,
            to: adminEmails.join(','),
            subject: ` Low Stock Alert: ${product.name}`,
            html: `
                <h2>Product Running Low!</h2>
                <p><strong>Product:</strong> ${product.name}</p>
                <p><strong>SKU:</strong> ${product.sku}</p>
                <p><strong>Current Quantity:</strong> ${product.quantity}</p>
                <p><strong>Reorder Level:</strong> ${product.reorder_level}</p>
                <p><strong>Suggested Order Quantity:</strong> ${suggestedQty}</p>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to: ${adminEmails.join(', ')}`);
    } catch (err) {
        console.error('Error sending email alert:', err);
    }
};

module.exports = { sendLowStockAlert };
