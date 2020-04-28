require("dotenv").config();

const client = require("./webpack.client.js");
const server = require("./webpack.server.js");

module.exports = [
  client
  // TODO: server
];
