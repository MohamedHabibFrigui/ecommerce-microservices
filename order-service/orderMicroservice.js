require("dotenv").config();
const path = require("path");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const mongoose = require("mongoose");
const Order = require("./models/Order");

// MongoDB Connection
mongoose
  .connect(process.env.ORDER_DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB (Order Service)"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Load proto file
const protoPath = path.join(__dirname, "order.proto");
const protoDefinition = protoLoader.loadSync(protoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const orderProto = grpc.loadPackageDefinition(protoDefinition).order;

// Implement service
const orderService = {
  getOrder: async (call, callback) => {
    try {
      const order = await Order.findById(call.request.order_id);
      if (!order) {
        return callback({
          code: grpc.status.NOT_FOUND,
          message: "Order not found",
        });
      }
      callback(null, { order });
    } catch (err) {
      callback({
        code: grpc.status.INTERNAL,
        message: err.message,
      });
    }
  },

  createOrder: async (call, callback) => {
    try {
      const { userId, items, total } = call.request;
      const order = new Order({ userId, items, total });
      const savedOrder = await order.save();
      callback(null, { order: savedOrder });
    } catch (err) {
      callback({
        code: grpc.status.INTERNAL,
        message: err.message,
      });
    }
  },

  updateOrderStatus: async (call, callback) => {
    try {
      const { order_id, status } = call.request;
      const order = await Order.findByIdAndUpdate(
        order_id,
        { status },
        { new: true }
      );
      if (!order) {
        return callback({
          code: grpc.status.NOT_FOUND,
          message: "Order not found",
        });
      }
      callback(null, { order });
    } catch (err) {
      callback({
        code: grpc.status.INTERNAL,
        message: err.message,
      });
    }
  },

  deleteOrder: async (call, callback) => {
    try {
      const result = await Order.findByIdAndDelete(call.request.order_id);
      callback(null, { success: !!result });
    } catch (err) {
      callback({
        code: grpc.status.INTERNAL,
        message: err.message,
      });
    }
  },

  listOrders: async (call, callback) => {
    try {
      const orders = await Order.find({ userId: call.request.userId });
      callback(null, { orders });
    } catch (err) {
      callback({
        code: grpc.status.INTERNAL,
        message: err.message,
      });
    }
  },
};

// Create and start gRPC server
const server = new grpc.Server();
server.addService(orderProto.OrderService.service, orderService);
const port = process.env.ORDER_SERVICE_PORT || 50052;
server.bindAsync(
  `0.0.0.0:${port}`,
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) {
      console.error("Failed to bind server:", err);
      return;
    }
    console.log(`Order microservice running on port ${port}`);
    server.start();
  }
);
