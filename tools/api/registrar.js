const redis = require("redis");
const request = require("request");

function load() {
  const registrar = new Registrar();

  registrar.onReady(function() {});
}

module.exports = class Registrar {
  constructor() {
    this.client = redis.createClient("127.0.0.1", 6379, {
      socket_nodelay: true
    });

    this.readyCallback();
  }

  onReady(callback) {
    this.readyCallback = callback;
  }
};

load();
