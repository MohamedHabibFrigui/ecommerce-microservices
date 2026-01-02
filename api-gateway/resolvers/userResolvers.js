const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const protoPath = path.join(__dirname, "user.proto");
const protoDefinition = protoLoader.loadSync(protoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const userProto = grpc.loadPackageDefinition(protoDefinition).user;
const userPort = process.env.USER_SERVICE_PORT || 50053;

const getUserClient = () => {
  return new userProto.UserService(
    `localhost:${userPort}`,
    grpc.credentials.createInsecure()
  );
};

module.exports = {
  Query: {
    user: (_, { id }) => {
      const client = getUserClient();
      return new Promise((resolve, reject) => {
        client.getUser({ user_id: id }, (err, response) => {
          if (err) reject(err);
          else resolve(response.user);
        });
      });
    },
    users: () => {
      const client = getUserClient();
      return new Promise((resolve, reject) => {
        client.getAllUsers({}, (err, response) => {
          if (err) reject(err);
          else resolve(response.users);
        });
      });
    },
  },
  Mutation: {
    createUser: (_, { input }) => {
      const client = getUserClient();
      return new Promise((resolve, reject) => {
        client.createUser(input, (err, response) => {
          if (err) reject(err);
          else resolve(response.user);
        });
      });
    },
    updateUser: (_, { id, input }) => {
      const client = getUserClient();
      return new Promise((resolve, reject) => {
        client.updateUser({ user_id: id, ...input }, (err, response) => {
          if (err) reject(err);
          else resolve(response.user);
        });
      });
    },
    deleteUser: (_, { id }) => {
      const client = getUserClient();
      return new Promise((resolve, reject) => {
        client.deleteUser({ user_id: id }, (err, response) => {
          if (err) reject(err);
          else resolve(response.success);
        });
      });
    },
    login: (_, { input }) => {
      const client = getUserClient();
      return new Promise((resolve, reject) => {
        client.authenticate(input, (err, response) => {
          if (err) reject(err);
          else resolve({ user: response.user, token: response.token });
        });
      });
    },
  },
};
