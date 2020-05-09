#!/usr/bin/env node

config = { debugLevel: "all", gver: 1 };

const Utils = require("../../server/js/util/utils");
const io = require("socket.io-client");
const _ = require("underscore");
const Log = require("../../server/js/util/log");
log = new Log("info");

const { port } = require("../../server/config");

class Entity {
  constructor(id, x, y, connection) {
    this.id = id;
    this.x = x;
    this.y = y;

    this.connection = connection;
  }
}

module.exports = Entity;

class Bot {
  constructor() {
    this.bots = [];
    this.botCount = 300;

    this.load();
  }

  load() {
    const connecting = setInterval(() => {
      this.connect();

      this.botCount--;

      if (this.botCount < 1) {
        clearInterval(connecting);
      }
    }, 100);

    setInterval(() => {
      _.each(this.bots, bot => {
        this.move(bot);

        if (Utils.randomInt(0, 50) === 10) {
          this.talk(bot);
        }
      });
    }, 2000);
  }

  connect() {
    let connection = null;

    connection = io(`ws://127.0.0.1:${port}`, {
      forceNew: true,
      reconnection: false
    });

    connection.on("connect", () => {
      log.info("Connection established...");

      connection.emit("client", {
        gVer: config.gver,
        cType: "HTML5",
        bot: true
      });
    });

    connection.on("connect_error", () => {
      log.info("Failed to establish connection.");
    });

    connection.on("message", message => {
      if (message.startsWith("[")) {
        const data = JSON.parse(message);

        if (data.length > 1) {
          _.each(data, msg => {
            this.handlePackets(connection, msg);
          });
        } else {
          this.handlePackets(connection, JSON.parse(message).shift());
        }
      } else {
        this.handlePackets(connection, message, "utf8");
      }
    });

    connection.on("disconnect", () => {});
  }

  handlePackets(connection, message, type) {
    if (type === "utf8" || !_.isArray(message)) {
      log.info(`Received UTF8 message ${message}.`);
      return;
    }

    const opcode = message.shift();

    switch (opcode) {
      case 0:
        this.send(connection, 1, [2, "n" + this.bots.length, "n", "n"]);

        break;

      case 2:
        const info = message.shift();

        this.bots.push(new Entity(info.instance, info.x, info.y, connection));

        break;

      case 14: // Combat
        break;
    }
  }

  send(connection, packet, data) {
    const json = JSON.stringify([packet, data]);

    if (connection && connection.connected) {
      connection.send(json);
    }
  }

  move(bot) {
    const currentX = bot.x;
    const currentY = bot.y;
    const newX = currentX + Utils.randomInt(-3, 3);
    const newY = currentY + Utils.randomInt(-3, 3);

    setTimeout(() => {
      // Movement Request
      this.send(bot.connection, 9, [0, newX, newY, currentX, currentY]);
    }, 250);

    setTimeout(() => {
      // Empty target packet
      this.send(bot.connection, 13, [2]);
    }, 250);

    setTimeout(() => {
      // Start Movement
      this.send(bot.connection, 9, [1, newX, newY, currentX, currentY, 250]);
    }, 250);

    setTimeout(() => {
      // Stop Movement
      this.send(bot.connection, 9, [3, newX, newY]);
    }, 1000);

    bot.x = newX;
    bot.y = newY;
  }

  talk(bot) {
    this.send(bot.connection, 20, ["am human, hello there."]);
  }
}

module.exports = Bot;

new Bot();
