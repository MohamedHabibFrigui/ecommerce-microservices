const express = require("express");
const router = express.Router();

module.exports = (orderClient) => {
  // Get order by ID
  router.get("/:id", (req, res) => {
    orderClient.getOrder({ order_id: req.params.id }, (err, response) => {
      if (err) {
        console.error("Order service error:", err);
        return res.status(500).json({ error: "Failed to fetch order" });
      }
      res.json(response.order);
    });
  });

  // Create order
  router.post("/", (req, res) => {
    orderClient.createOrder(req.body, (err, response) => {
      if (err) {
        console.error("Order service error:", err);
        return res.status(500).json({ error: "Failed to create order" });
      }
      res.status(201).json(response.order);
    });
  });

  // Update order status
  router.put("/:id/status", (req, res) => {
    orderClient.updateOrderStatus(
      { order_id: req.params.id, status: req.body.status },
      (err, response) => {
        if (err) {
          console.error("Order service error:", err);
          return res
            .status(500)
            .json({ error: "Failed to update order status" });
        }
        res.json(response.order);
      }
    );
  });

  // Delete order
  router.delete("/:id", (req, res) => {
    orderClient.deleteOrder({ order_id: req.params.id }, (err, response) => {
      if (err) {
        console.error("Order service error:", err);
        return res.status(500).json({ error: "Failed to delete order" });
      }
      res.json({ success: response.success });
    });
  });

  // List orders by user
  router.get("/user/:userId", (req, res) => {
    orderClient.listOrders({ userId: req.params.userId }, (err, response) => {
      if (err) {
        console.error("Order service error:", err);
        return res.status(500).json({ error: "Failed to fetch orders" });
      }
      res.json(response.orders);
    });
  });

  return router;
};
