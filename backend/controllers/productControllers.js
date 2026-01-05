const pool = require("../db/db");
const path = require("path");
const fs = require("fs");
const barCode = require("../utils/barcode");
const logController = require("./logControllers");
const { sendLowStockAlert } = require("../utils/mailer");

const addProduct = async (req, res) => {
  const { sku, name, brand, category, quantity, reorder_level, expiry } =
    req.body;
  const barcode = `INV-${sku}`;
  try {
    const user_id = req.user.id;
    await pool.query(
      "INSERT INTO products (sku, name, brand, barcode, category, quantity, reorder_level, expiry) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
      [sku, name, brand, barcode, category, quantity, reorder_level, expiry]
    );
    const barcodeUrl = await barCode.generateBarcodeImage(sku, barcode);
    await logController.createLog(sku, null, quantity, user_id);
    res.status(201).json({ message: "Product added successfully", barcodeUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding product" });
  }
};

const getAllProducts = async (req, res) => {
  const { sku, name, category, stock_ll, stock_ul } = req.query;
  const params = [];
  let idx = 1;

  let query = `
        SELECT
            sku,
            name,
            brand,
            category,
            quantity,
            reorder_level,
            expiry
        FROM products
        WHERE 1=1
    `;

  if (sku) {
    query += ` AND sku ILIKE $${idx++}`;
    params.push(`%${sku}%`);
  }
  if (name) {
    query += ` AND name ILIKE $${idx++}`;
    params.push(`%${name}%`);
  }
  if (category) {
    query += ` AND category ILIKE $${idx++}`;
    params.push(`%${category}%`);
  }
  if (stock_ll) {
    query += ` AND quantity > $${idx++}`;
    params.push(stock_ll);
  }
  if (stock_ul) {
    query += ` AND quantity < $${idx++}`;
    params.push(stock_ul);
  }

  query += " ORDER BY name ASC";

  try {
    const result = await pool.query(query, params);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error displaying product list" });
  }
};

const updateProduct = async (req, res) => {
  const { sku } = req.params;
  const { name, category, amount, reorder_level, expiry, action } = req.body;
  const user_id = req.user.id;
  try {
    let query;
    if (action === "sale") {
      query =
        "UPDATE products SET name = $1, brand = $2, category = $3, quantity = quantity - $4, reorder_level = $5, expiry = $6 WHERE sku = $7 RETURNING *";
    } else if (action === "return" || action === "restock") {
      query =
        "UPDATE products SET name = $1, brand = $2, category = $3, quantity = quantity + $4, reorder_level = $5, expiry = $6 WHERE sku = $7 RETURNING *";
    } else {
      return res.status(400).json({ message: "Invalid action type" });
    }

    const result = await pool.query(query, [
      name,
      brand,
      category,
      amount,
      reorder_level,
      expiry,
      sku,
    ]);
    const updatedProduct = result.rows[0];

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (
      action === "sale" &&
      updatedProduct.quantity <= updatedProduct.reorder_level
    ) {
      await sendLowStockAlert(updatedProduct);
    }

    await logController.createLog(sku, action, amount, user_id);
    res.status(200).json({ message: "Product updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating product" });
  }
};

const updateQuantity = async (req, res) => {
  const { sku } = req.params;
  const { action, amount } = req.body;
  const user_id = req.user.id;
  try {
    let query;
    if (action === "sale") {
      query =
        "UPDATE products SET quantity = quantity - $1 WHERE sku = $2 RETURNING *";
    } else if (action === "return" || action === "restock") {
      query =
        "UPDATE products SET quantity = quantity + $1 WHERE sku = $2 RETURNING *";
    } else {
      return res.status(400).json({ message: "Invalid action type" });
    }

    const result = await pool.query(query, [amount, sku]);
    const updatedProduct = result.rows[0];

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (
      action === "sale" &&
      updatedProduct.quantity <= updatedProduct.reorder_level
    ) {
      await sendLowStockAlert(updatedProduct);
    }

    await logController.createLog(sku, action, amount, user_id);
    res.status(200).json({ message: "Quantity updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating quantity" });
  }
};

const deleteProduct = async (req, res) => {
  const { sku } = req.params;
  const user_id = req.user.id;
  try {
    const result = await pool.query(
      "DELETE FROM products WHERE sku = $1 RETURNING *",
      [sku]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    await logController.createLog(sku, "deleted", null, user_id);
    res.status(200).json({ message: "Product deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting product" });
  }
};

const updateProductbyBarcode = async (req, res) => {
  const { barcode } = req.params;
  const { action, amount } = req.body;
  const user_id = req.user.id;
  try {
    let query;
    if (action === "sale") {
      query =
        "UPDATE products SET quantity = quantity - $1 WHERE barcode = $2 RETURNING *";
    } else if (action === "return" || action === "restock") {
      query =
        "UPDATE products SET quantity = quantity + $1 WHERE barcode = $2 RETURNING *";
    } else {
      return res.status(400).json({ message: "Invalid action type" });
    }

    const result = await pool.query(query, [amount, barcode]);
    const updatedProduct = result.rows[0];

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (
      action === "sale" &&
      updatedProduct.quantity <= updatedProduct.reorder_level
    ) {
      await sendLowStockAlert(updatedProduct);
    }

    await logController.createLog(updatedProduct.sku, action, amount, user_id);
    res.status(200).json(updatedProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating quantity" });
  }
};

const getProductByBarcode = async (req, res) => {
  const { barcode } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM products WHERE barcode = $1",
      [barcode]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching product by barcode" });
  }
};

const getBarcodeImg = async (req, res) => {
  const { sku } = req.params;
  const imagePath = path.join(__dirname, "..", "barcodes", `${sku}.png`);
  fs.access(imagePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ message: "Barcode image not found" });
    }
    return res.status(200).sendFile(imagePath);
  });
};

module.exports = {
  addProduct,
  getAllProducts,
  updateProduct,
  updateQuantity,
  deleteProduct,
  updateProductbyBarcode,
  getProductByBarcode,
  getBarcodeImg,
};
