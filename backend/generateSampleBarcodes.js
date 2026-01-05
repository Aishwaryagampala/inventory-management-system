require("dotenv").config();

const pool = require("./db/db");
const { generateBarcodeImage } = require("./utils/barcode");

const argv = process.argv.slice(2);
const force = argv.includes("--force");
const dryRun = argv.includes("--dry-run");

(async () => {
  try {
    if (force) {
      console.log("Force mode enabled: processing ALL products");
    } else if (dryRun) {
      console.log("Dry run mode: no DB or file changes will be made");
    } else {
      console.log("Processing products with missing barcodes only");
    }

    const selectQuery = force
      ? "SELECT sku, barcode FROM products"
      : "SELECT sku, barcode FROM products WHERE barcode IS NULL OR barcode = ''";

    const result = await pool.query(selectQuery);

    if (result.rows.length === 0) {
      console.log(
        force
          ? "No products found in the database."
          : "No products without barcodes found. Use --force to (re)generate for all products."
      );
      process.exit(0);
    }

    for (const row of result.rows) {
      const sku = row.sku;
      const barcodeText =
        row.barcode && String(row.barcode).trim() ? row.barcode : `INV-${sku}`;

      console.log(`Processing SKU=${sku}, barcode=${barcodeText}`);

      if (dryRun) {
        console.log("  Dry run: would update DB and generate image");
        continue;
      }

      if (force || !row.barcode) {
        await pool.query("UPDATE products SET barcode = $2 WHERE sku = $1", [
          sku,
          barcodeText,
        ]);
      }

      await generateBarcodeImage(sku, barcodeText);
    }

    console.log("Barcode generation completed for selected products.");
  } catch (err) {
    console.error("Error generating barcodes for products:", err);
  } finally {
    await pool.end();
    process.exit(0);
  }
})();
