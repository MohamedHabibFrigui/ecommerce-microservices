require("dotenv").config();
const express = require("express");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const bodyParser = require("body-parser");
const cors = require("cors");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

// Import route files
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");

// Import GraphQL schema and resolvers
const typeDefs = require("./schema");
const resolvers = require("./resolvers");

// Create Express app
const app = express();

// Load proto files
const loadProto = (protoPath) => {
  return protoLoader.loadSync(path.join(__dirname, protoPath), {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });
};

// Product Service gRPC Client
const productProtoDefinition = loadProto("../product-service/product.proto");
const productProto = grpc.loadPackageDefinition(productProtoDefinition).product;
const productClient = new productProto.ProductService(
  `localhost:${process.env.PRODUCT_SERVICE_PORT}` || "localhost:50051",
  grpc.credentials.createInsecure()
);

// Order Service gRPC Client
const orderProtoDefinition = loadProto("../order-service/order.proto");
const orderProto = grpc.loadPackageDefinition(orderProtoDefinition).order;
const orderClient = new orderProto.OrderService(
  `localhost:${process.env.ORDER_SERVICE_PORT}` || "localhost:50052",
  grpc.credentials.createInsecure()
);

// User Service gRPC Client
const userProtoDefinition = loadProto("../user-service/user.proto");
const userProto = grpc.loadPackageDefinition(userProtoDefinition).user;
const userClient = new userProto.UserService(
  `localhost:${process.env.USER_SERVICE_PORT}` || "localhost:50053",
  grpc.credentials.createInsecure()
);

// Initialize Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true, // Enable for development
});

// Apply middleware
async function startServer() {
  await server.start();

  // GraphQL Middleware
  app.use(
    "/graphql",
    cors(),
    bodyParser.json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({
        token: req.headers.authorization,
        productClient,
      }),
    })
  );

  // REST Middleware
  app.use(cors());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // Routes
  app.use("/products", productRoutes(productClient));
  app.use("/orders", orderRoutes(orderClient));
  app.use("/users", userRoutes(userClient));

  // Start Server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
    console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
