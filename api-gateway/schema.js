const { gql } = require("@apollo/server");

const typeDefs = `#graphql
  type Product {
    id: ID!
    name: String!
    description: String!
    price: Float!
    stock: Int!
    category: String!
    createdAt: String
  }

  type OrderItem {
  productId: ID!
  quantity: Int!
  price: Float!
  }

  type Order {
    id: ID!
    userId: ID!
    items: [OrderItem!]!
    total: Float!
    status: String!
    createdAt: String
  }

  type User {
  id: ID!
  email: String!
  name: String!
  role: String!
  createdAt: String
  }

  input ProductInput {
    name: String!
    description: String!
    price: Float!
    stock: Int!
    category: String!
  }

  input ProductUpdateInput {
    name: String
    description: String
    price: Float
    stock: Int
    category: String
  }

  input OrderItemInput {
  productId: ID!
  quantity: Int!
  price: Float!
}

  input CreateOrderInput {
    userId: ID!
    items: [OrderItemInput!]!
    total: Float!
  }

  input UpdateOrderStatusInput {
    orderId: ID!
    status: String!
  }

  input CreateUserInput {
  email: String!
  name: String!
  password: String!
  role: String
  }

  input UpdateUserInput {
    email: String
    name: String
    role: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  type AuthPayload {
    user: User!
    token: String!
  }

  type Query {
    product(id: ID!): Product
    products: [Product]
    searchProducts(query: String!): [Product]
  }
  
  type Query {
  order(id: ID!): Order
  orders(userId: ID!): [Order!]
  }

  type Query {
  user(id: ID!): User
  users: [User!]
  }

  type Mutation {
    createProduct(input: ProductInput!): Product
    updateProduct(id: ID!, input: ProductUpdateInput!): Product
    deleteProduct(id: ID!): Boolean
  }

  type Mutation {
  createOrder(input: CreateOrderInput!): Order
  updateOrderStatus(input: UpdateOrderStatusInput!): Order
  deleteOrder(id: ID!): Boolean
  }

  type Mutation {
  createUser(input: CreateUserInput!): User
  updateUser(id: ID!, input: UpdateUserInput!): User
  deleteUser(id: ID!): Boolean
  login(input: LoginInput!): AuthPayload
  }
`;

module.exports = typeDefs;
