let cls = require("../../server/js/lib/class");
let redis = require("redis");
let request = require("request");

function load() {
  let registrar = new Registrar();

  registrar.onReady(function() {});
}

module.exports = Registrar = cls.Class.extend({
  init: function() {
    let self = this;

    self.client = redis.createClient("127.0.0.1", 6379, {
      socket_nodelay: true
    });

    self.readyCallback();
  },

  onReady: function(callback) {
    this.readyCallback = callback;
  }
});

load();
