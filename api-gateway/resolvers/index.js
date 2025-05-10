const { mergeResolvers } = require("@graphql-tools/merge");
const productResolvers = require("./productResolvers");
const orderResolvers = require("./orderResolvers");
const userResolvers = require("./userResolvers");

// Combine all resolvers
const resolvers = mergeResolvers([
  productResolvers,
  orderResolvers,
  userResolvers,
]);

module.exports = resolvers;
