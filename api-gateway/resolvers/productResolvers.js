const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const productProtoPath = path.join(__dirname, "product.proto");
const productProtoDefinition = protoLoader.loadSync(productProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const productProto = grpc.loadPackageDefinition(productProtoDefinition).product;
const productPort = process.env.PRODUCT_SERVICE_PORT || 50051;

const getProductClient = () => {
  return new productProto.ProductService(
    `localhost:${productPort}`,
    grpc.credentials.createInsecure()
  );
};

module.exports = {
  Query: {
    product: (_, { id }) => {
      const client = getProductClient();
      return new Promise((resolve, reject) => {
        client.getProduct({ product_id: id }, (err, response) => {
          if (err) reject(err);
          else resolve(response.product);
        });
      });
    },
    products: () => {
      const client = getProductClient();
      return new Promise((resolve, reject) => {
        client.searchProducts({ query: "" }, (err, response) => {
          if (err) reject(err);
          else resolve(response.products);
        });
      });
    },
    searchProducts: (_, { query }) => {
      const client = getProductClient();
      return new Promise((resolve, reject) => {
        client.searchProducts({ query }, (err, response) => {
          if (err) reject(err);
          else resolve(response.products);
        });
      });
    },
  },
  Mutation: {
    createProduct: (_, { input }) => {
      const client = getProductClient();
      return new Promise((resolve, reject) => {
        client.createProduct(input, (err, response) => {
          if (err) reject(err);
          else resolve(response.product);
        });
      });
    },
    updateProduct: (_, { id, input }) => {
      const client = getProductClient();
      return new Promise((resolve, reject) => {
        client.updateProduct({ product_id: id, ...input }, (err, response) => {
          if (err) reject(err);
          else resolve(response.product);
        });
      });
    },
    deleteProduct: (_, { id }) => {
      const client = getProductClient();
      return new Promise((resolve, reject) => {
        client.deleteProduct({ product_id: id }, (err, response) => {
          if (err) reject(err);
          else resolve(response.success);
        });
      });
    },
  },
};
