require("dotenv").config();
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("./models/User");

// MongoDB Connection
mongoose
  .connect(process.env.USER_DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB (User Service)"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Load proto file
const protoPath = "user-service/user.proto";
const protoDefinition = protoLoader.loadSync(protoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const userProto = grpc.loadPackageDefinition(protoDefinition).user;

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET;

// Implement service
const userService = {
  getUser: async (call, callback) => {
    try {
      const user = await User.findById(call.request.user_id);
      if (!user) {
        return callback({
          code: grpc.status.NOT_FOUND,
          message: "User not found",
        });
      }
      callback(null, { user });
    } catch (err) {
      callback({
        code: grpc.status.INTERNAL,
        message: err.message,
      });
    }
  },

  getAllUsers: async (call, callback) => {
    try {
      const users = await User.find().sort({ name: 1 });
      callback(null, { users });
    } catch (err) {
      callback({
        code: grpc.status.INTERNAL,
        message: err.message,
      });
    }
  },

  createUser: async (call, callback) => {
    try {
      const { email, name, password, role } = call.request;
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return callback({
          code: grpc.status.ALREADY_EXISTS,
          message: "User already exists",
        });
      }
      const user = new User({ email, name, password, role });
      const savedUser = await user.save();
      callback(null, { user: savedUser });
    } catch (err) {
      callback({
        code: grpc.status.INTERNAL,
        message: err.message,
      });
    }
  },

  updateUser: async (call, callback) => {
    try {
      const { user_id, email, name, role } = call.request;
      const user = await User.findByIdAndUpdate(
        user_id,
        { email, name, role },
        { new: true }
      );
      if (!user) {
        return callback({
          code: grpc.status.NOT_FOUND,
          message: "User not found",
        });
      }
      callback(null, { user });
    } catch (err) {
      callback({
        code: grpc.status.INTERNAL,
        message: err.message,
      });
    }
  },

  deleteUser: async (call, callback) => {
    try {
      const result = await User.findByIdAndDelete(call.request.user_id);
      callback(null, { success: !!result });
    } catch (err) {
      callback({
        code: grpc.status.INTERNAL,
        message: err.message,
      });
    }
  },

  authenticate: async (call, callback) => {
    try {
      const { email, password } = call.request;
      const user = await User.findOne({ email });
      if (!user) {
        return callback({
          code: grpc.status.NOT_FOUND,
          message: "User not found",
        });
      }
      const isValid = await user.comparePassword(password);
      if (!isValid) {
        return callback({
          code: grpc.status.UNAUTHENTICATED,
          message: "Invalid credentials",
        });
      }
      const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
        expiresIn: "1h",
      });
      callback(null, { user, token });
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
server.addService(userProto.UserService.service, userService);
const port = process.env.USER_SERVICE_PORT || 50053;
server.bindAsync(
  `0.0.0.0:${port}`,
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) {
      console.error("Failed to bind server:", err);
      return;
    }
    console.log(`User microservice running on port ${port}`);
    server.start();
  }
);
