const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const pool = require('../config/db');

const exportProductsToExcel = async (req, res) => {
    try {
        const { category, name, sku, low_stock } = req.query;
        let query = 'SELECT * FROM products WHERE 1=1';
        const params = [];
        let i = 1;

        if (category) {
            query += ` AND category ILIKE $${i++}`;
            params.push(`%${category}%`);
        }
        if (name) {
            query += ` AND name ILIKE $${i++}`;
            params.push(`%${name}%`);
        }
        if (sku) {
            query += ` AND sku ILIKE $${i++}`;
            params.push(`%${sku}%`);
        }
        if (low_stock === 'true') {
            query += ` AND quantity <= reorder_level + 5`;
        }

        const result = await pool.query(query, params);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Products');

        if (result.rows.length > 0) {
            worksheet.columns = Object.keys(result.rows[0]).map(key => ({
                header: key.toUpperCase(), key
            }));
            result.rows.forEach(row => worksheet.addRow(row));
        }

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=products.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error exporting products to Excel' });
    }
};

const exportProductsToPDF = async (req, res) => {
    try {
        const { category, name, sku, low_stock } = req.query;
        let query = 'SELECT * FROM products WHERE 1=1';
        const params = [];
        let i = 1;

        if (category) {
            query += ` AND category ILIKE $${i++}`;
            params.push(`%${category}%`);
        }
        if (name) {
            query += ` AND name ILIKE $${i++}`;
            params.push(`%${name}%`);
        }
        if (sku) {
            query += ` AND sku ILIKE $${i++}`;
            params.push(`%${sku}%`);
        }
        if (low_stock === 'true') {
            query += ` AND quantity <= reorder_level + 5`;
        }

        const result = await pool.query(query, params);

        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=products.pdf');

        doc.pipe(res);
        doc.fontSize(14).text('Filtered Product List', { underline: true });
        doc.moveDown();

        result.rows.forEach(p => {
            doc.fontSize(10).text(
                `SKU: ${p.sku} | Name: ${p.name} | Qty: ${p.quantity} | Category: ${p.category} | Reorder: ${p.reorder_level}`
            );
            doc.moveDown(0.5);
        });

        doc.end();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error exporting products to PDF' });
    }
};

const exportLogsToExcel = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        const params = [];
        let i = 1;

        let query = `
            SELECT inventory_logs.*, users.username AS user
            FROM inventory_logs
            JOIN users ON inventory_logs.user_id = users.id
            WHERE 1=1
        `;

        if (start_date) {
            query += ` AND inventory_logs.created_at >= $${i++}`;
            params.push(start_date);
        }
        if (end_date) {
            query += ` AND inventory_logs.created_at <= $${i++}`;
            params.push(end_date);
        }

        query += ' ORDER BY inventory_logs.created_at DESC';
        const result = await pool.query(query, params);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Logs');

        if (result.rows.length > 0) {
            worksheet.columns = Object.keys(result.rows[0]).map(key => ({
                header: key.toUpperCase(), key
            }));
            result.rows.forEach(row => worksheet.addRow(row));
        }

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=logs.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error exporting logs to Excel' });
    }
};

const exportLogsToPDF = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        const params = [];
        let i = 1;

        let query = `
            SELECT inventory_logs.*, users.username AS user
            FROM inventory_logs
            JOIN users ON inventory_logs.user_id = users.id
            WHERE 1=1
        `;

        if (start_date) {
            query += ` AND inventory_logs.created_at >= $${i++}`;
            params.push(start_date);
        }
        if (end_date) {
            query += ` AND inventory_logs.created_at <= $${i++}`;
            params.push(end_date);
        }

        query += ' ORDER BY inventory_logs.created_at DESC';
        const result = await pool.query(query, params);

        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=logs.pdf');

        doc.pipe(res);
        doc.fontSize(14).text('Filtered Inventory Logs', { underline: true });
        doc.moveDown();

        result.rows.forEach(log => {
            doc.fontSize(10).text(
                `SKU: ${log.sku} | Action: ${log.action} | Qty: ${log.amount} | User: ${log.user} | Time: ${log.created_at}`
            );
            doc.moveDown(0.5);
        });

        doc.end();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error exporting logs to PDF' });
    }
};

module.exports = {
    exportProductsToExcel,
    exportProductsToPDF,
    exportLogsToExcel,
    exportLogsToPDF
};
