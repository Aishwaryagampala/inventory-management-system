const express = require("express");
const router = express.Router();
const productController = require("../controllers/productControllers");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post(
  "/add",
  authMiddleware,
  roleMiddleware(["admin"]),
  productController.addProduct
);
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["admin", "staff"]),
  productController.getAllProducts
);
router.put(
  "/:sku",
  authMiddleware,
  roleMiddleware(["admin"]),
  productController.updateProduct
);
router.patch(
  "/:sku/quantity",
  authMiddleware,
  roleMiddleware(["admin", "staff"]),
  productController.updateQuantity
);
router.delete(
  "/:sku",
  authMiddleware,
  roleMiddleware(["admin"]),
  productController.deleteProduct
);
router.put(
  "/scan/:barcode",
  authMiddleware,
  roleMiddleware(["staff"]),
  productController.updateProductbyBarcode
);
router.get(
  "/scan/:barcode",
  authMiddleware,
  roleMiddleware(["staff"]),
  productController.getProductByBarcode
);
router.get(
  "/barcode/:sku",
  authMiddleware,
  roleMiddleware(["admin"]),
  productController.getBarcodeImg
);

module.exports = router;
