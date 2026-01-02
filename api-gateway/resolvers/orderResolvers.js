const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const orderProtoPath = path.join(__dirname, "order.proto");
const orderProtoDefinition = protoLoader.loadSync(orderProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const orderProto = grpc.loadPackageDefinition(orderProtoDefinition).order;
const orderPort = process.env.ORDER_SERVICE_PORT || 50052;

const getOrderClient = () => {
  return new orderProto.OrderService(
    `localhost:${orderPort}`,
    grpc.credentials.createInsecure()
  );
};

module.exports = {
  Query: {
    order: (_, { id }) => {
      const client = getOrderClient();
      return new Promise((resolve, reject) => {
        client.getOrder({ order_id: id }, (err, response) => {
          if (err) reject(err);
          else resolve(response.order);
        });
      });
    },
    orders: (_, { userId }) => {
      const client = getOrderClient();
      return new Promise((resolve, reject) => {
        client.listOrders({ userId }, (err, response) => {
          if (err) reject(err);
          else resolve(response.orders);
        });
      });
    },
  },
  Mutation: {
    createOrder: (_, { input }) => {
      const client = getOrderClient();
      return new Promise((resolve, reject) => {
        client.createOrder(input, (err, response) => {
          if (err) reject(err);
          else resolve(response.order);
        });
      });
    },
    updateOrderStatus: (_, { input }) => {
      const client = getOrderClient();
      return new Promise((resolve, reject) => {
        client.updateOrderStatus(
          { order_id: input.orderId, status: input.status },
          (err, response) => {
            if (err) reject(err);
            else resolve(response.order);
          }
        );
      });
    },
    deleteOrder: (_, { id }) => {
      const client = getOrderClient();
      return new Promise((resolve, reject) => {
        client.deleteOrder({ order_id: id }, (err, response) => {
          if (err) reject(err);
          else resolve(response.success);
        });
      });
    },
  },
};
