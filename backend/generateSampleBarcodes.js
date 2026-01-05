// One-off script to generate barcodes and barcode images
// for all existing products in the database.
//
// Usage (from backend folder, with .env configured):
//   node generateSampleBarcodes.js

require('dotenv').config();

const pool = require('./db/db');
const { generateBarcodeImage } = require('./utils/barcode');

(async () => {
  try {
    console.log('Fetching products without barcodes (or all products)...');

    // You can tighten this WHERE clause if you only want rows without barcode
    const result = await pool.query(
      'SELECT sku, barcode FROM products'
    );

    if (result.rows.length === 0) {
      console.log('No products found in the database.');
      process.exit(0);
    }

    for (const row of result.rows) {
      const sku = row.sku;
      const barcodeText = row.barcode || `INV-${sku}`;

      console.log(`Processing SKU=${sku}, barcode=${barcodeText}`);

      // Ensure DB has the barcode text
      await pool.query(
        'UPDATE products SET barcode = $2 WHERE sku = $1',
        [sku, barcodeText]
      );

      // Generate and save barcode image file
      await generateBarcodeImage(sku, barcodeText);
    }

    console.log('Barcode generation completed for all products.');
  } catch (err) {
    console.error('Error generating barcodes for products:', err);
  } finally {
    await pool.end();
    process.exit(0);
  }
})();


