const express = require("express");
const router = express.Router();

module.exports = (productClient) => {
  // Get all products or search products
  router.get("/", (req, res) => {
    productClient.searchProducts(
      { query: req.query.q || "" },
      (err, response) => {
        if (err) {
          console.error("Product service error:", err);
          return res.status(500).json({ error: "Failed to fetch products" });
        }
        res.json(response.products);
      }
    );
  });

  // Get single product
  router.get("/:id", (req, res) => {
    productClient.getProduct({ product_id: req.params.id }, (err, response) => {
      if (err) {
        console.error("Product service error:", err);
        if (err.code === 5) {
          // NOT_FOUND
          return res.status(404).json({ error: "Product not found" });
        }
        return res.status(500).json({ error: "Failed to fetch product" });
      }
      res.json(response.product);
    });
  });

  // Create new product
  router.post("/", (req, res) => {
    const { name, description, price, stock, category } = req.body;

    if (!name || !description || !price || !stock || !category) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    productClient.createProduct(req.body, (err, response) => {
      if (err) {
        console.error("Product service error:", err);
        return res.status(500).json({ error: "Failed to create product" });
      }
      res.status(201).json(response.product);
    });
  });

  // Update product
  router.put("/:id", (req, res) => {
    const updateData = {
      product_id: req.params.id,
      ...req.body,
    };

    productClient.updateProduct(updateData, (err, response) => {
      if (err) {
        console.error("Product service error:", err);
        if (err.code === 5) {
          // NOT_FOUND
          return res.status(404).json({ error: "Product not found" });
        }
        return res.status(500).json({ error: "Failed to update product" });
      }
      res.json(response.product);
    });
  });

  // Delete product
  router.delete("/:id", (req, res) => {
    productClient.deleteProduct(
      { product_id: req.params.id },
      (err, response) => {
        if (err) {
          console.error("Product service error:", err);
          if (err.code === 5) {
            // NOT_FOUND
            return res.status(404).json({ error: "Product not found" });
          }
          return res.status(500).json({ error: "Failed to delete product" });
        }
        res.json({ success: response.success });
      }
    );
  });

  return router;
};
