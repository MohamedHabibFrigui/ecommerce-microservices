require("dotenv").config();
const path = require("path");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const mongoose = require("mongoose");
const Product = require("./models/Product");

// MongoDB Connection
mongoose
  .connect(process.env.PRODUCT_DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB (Product Service)"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Load proto file
const protoPath = path.join(__dirname, "product.proto");
const protoDefinition = protoLoader.loadSync(protoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const productProto = grpc.loadPackageDefinition(protoDefinition).product;

// Implement service
const productService = {
  getProduct: async (call, callback) => {
    try {
      const product = await Product.findById(call.request.product_id);
      if (!product) {
        return callback({
          code: grpc.status.NOT_FOUND,
          message: "Product not found",
        });
      }
      callback(null, { product });
    } catch (err) {
      callback({
        code: grpc.status.INTERNAL,
        message: err.message,
      });
    }
  },

  searchProducts: async (call, callback) => {
    try {
      const query = call.request.query || "";

      // If empty query, return all products sorted by name
      if (!query.trim()) {
        const products = await Product.find().sort({ name: 1 });
        return callback(null, { products });
      }

      // Text search with scoring
      const products = await Product.find(
        { $text: { $search: query } },
        { score: { $meta: "textScore" } }
      ).sort({ score: { $meta: "textScore" } });

      callback(null, { products });
    } catch (err) {
      console.error("Search error:", err);
      callback({
        code: grpc.status.INTERNAL,
        message: err.message,
      });
    }
  },

  createProduct: async (call, callback) => {
    try {
      const { name, description, price, stock, category } = call.request;
      const product = new Product({
        name,
        description,
        price,
        stock,
        category,
      });
      const savedProduct = await product.save();
      callback(null, { product: savedProduct });
    } catch (err) {
      callback({
        code: grpc.status.INTERNAL,
        message: err.message,
      });
    }
  },

  updateProduct: async (call, callback) => {
    try {
      const { product_id, name, description, price, stock, category } =
        call.request;
      const product = await Product.findByIdAndUpdate(
        product_id,
        { name, description, price, stock, category },
        { new: true }
      );

      if (!product) {
        return callback({
          code: grpc.status.NOT_FOUND,
          message: "Product not found",
        });
      }

      callback(null, { product });
    } catch (err) {
      callback({
        code: grpc.status.INTERNAL,
        message: err.message,
      });
    }
  },

  deleteProduct: async (call, callback) => {
    try {
      const result = await Product.findByIdAndDelete(call.request.product_id);
      callback(null, { success: !!result });
    } catch (err) {
      callback({
        code: grpc.status.INTERNAL,
        message: err.message,
      });
    }
  },
};

// Create and start server
const server = new grpc.Server();
server.addService(productProto.ProductService.service, productService);
const port = process.env.PRODUCT_SERVICE_PORT || 50051;
server.bindAsync(
  `0.0.0.0:${port}`,
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) {
      console.error("Failed to bind server:", err);
      return;
    }
    console.log(`Product microservice running on port ${port}`);
    server.start();
  }
);
