const express = require("express");
const { loginLimiter } = require("../middleware/rateLimit");
const router = express.Router();

module.exports = (userClient) => {
  // Get user by ID
  router.get("/:id", (req, res) => {
    userClient.getUser({ user_id: req.params.id }, (err, response) => {
      if (err) {
        console.error("User service error:", err);
        return res.status(500).json({ error: "Failed to fetch user" });
      }
      res.json(response.user);
    });
  });

  // Create user
  router.post("/", (req, res) => {
    userClient.createUser(req.body, (err, response) => {
      if (err) {
        console.error("User service error:", err);
        return res.status(500).json({ error: "Failed to create user" });
      }
      res.status(201).json(response.user);
    });
  });

  // Update user
  router.put("/:id", (req, res) => {
    userClient.updateUser(
      { user_id: req.params.id, ...req.body },
      (err, response) => {
        if (err) {
          console.error("User service error:", err);
          return res.status(500).json({ error: "Failed to update user" });
        }
        res.json(response.user);
      }
    );
  });

  // Delete user
  router.delete("/:id", (req, res) => {
    userClient.deleteUser({ user_id: req.params.id }, (err, response) => {
      if (err) {
        console.error("User service error:", err);
        return res.status(500).json({ error: "Failed to delete user" });
      }
      res.json({ success: response.success });
    });
  });

  // Login
  router.post("/login", loginLimiter, (req, res) => {
    userClient.authenticate(req.body, (err, response) => {
      if (err) {
        console.error("User service error:", err);
        return res.status(401).json({ error: "Authentication failed" });
      }
      res.json({ user: response.user, token: response.token });
    });
  });

  return router;
};
