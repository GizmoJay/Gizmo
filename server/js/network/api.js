const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const _ = require("underscore");
const APIConstants = require("../util/apiconstants");
const Utils = require("../util/utils");

class API {
  /**
   * API will have a variety of uses. Including communication
   * between multiple worlds (planned for the future).
   *
   * `accessToken` - A randomly generated token that can be used
   * to verify the validity between the client and the server.
   * This is a rudimentary security method, but is enough considering
   * the simplicity of the current API.
   */

  constructor(world) {
    const self = this;

    self.world = world;

    if (!config.apiEnabled) return;

    const app = express();

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    const router = express.Router();

    self.handle(router);

    app.use("/", router);

    app.listen(config.apiPort, () => {
      log.notice(config.name + " API has successfully initialized.");
    });
  }

  handle(router) {
    const self = this;

    router.get("/", (request, response) => {
      response.json({
        name: config.name,
        port: config.port, // Sends the server port.
        gameVersion: config.gver,
        maxPlayers: config.maxPlayers,
        playerCount: self.world.getPopulation()
      });
    });

    router.post("/player", (request, response) => {
      self.handlePlayer(request, response);
    });

    router.post("/chat", (request, response) => {
      self.handleChat(request, response);
    });

    router.get("/players", (request, response) => {
      self.handlePlayers(request, response);
    });
  }

  handlePlayer(request, response) {
    const self = this;

    if (!self.verifyToken(request.body.accessToken)) {
      self.returnError(
        response,
        APIConstants.MALFORMED_PARAMETERS,
        "Invalid `accessToken` specified for /player POST request."
      );
      return;
    }

    const username = request.body.username;

    if (!username) {
      self.returnError(
        response,
        APIConstants.MALFORMED_PARAMETERS,
        "No `username` variable received."
      );
      return;
    }

    if (!self.world.isOnline(username)) {
      self.returnError(
        response,
        APIConstants.PLAYER_NOT_ONLINE,
        `Player ${username} is not online.`
      );
      return;
    }

    const player = self.world.getPlayerByName(username);

    response.json(self.getPlayerData(player));
  }

  handleChat(request, response) {
    const self = this;

    if (!self.verifyToken(request.body.accessToken)) {
      self.returnError(
        response,
        APIConstants.MALFORMED_PARAMETERS,
        "Invalid `accessToken` specified for /chat POST request."
      );
      return;
    }

    const text = Utils.parseMessage(request.body.text);
    const source = Utils.parseMessage(request.body.source);
    const colour = request.body.colour;
    const username = request.body.username;

    if (username) {
      const player = self.world.getPlayerByName(username);

      if (player) player.chat(source, text, colour);

      response.json({ status: "success" });

      return;
    }

    self.world.globalMessage(source, text, colour);

    response.json({ status: "success" });
  }

  handlePlayers(request, response) {
    const self = this;

    if (!self.verifyToken(request.query.accessToken)) {
      self.returnError(
        response,
        APIConstants.MALFORMED_PARAMETERS,
        "Invalid `accessToken` specified for /players GET request."
      );
      return;
    }

    const players = {};

    _.each(self.world.players, player => {
      players[player.username] = self.getPlayerData(player);
    });

    response.json(players);
  }

  pingHub() {
    const self = this;
    const url = self.getUrl("ping");
    const data = {
      form: {
        serverId: config.serverId,
        accessToken: config.accessToken,
        port: config.apiPort,
        remoteServerHost: config.remoteServerHost
      }
    };

    request.post(url, data, (error, response, body) => {
      try {
        const data = JSON.parse(body);

        if (data.status === "success") {
          if (!self.hubConnected) {
            log.notice("Connected to Gizmo Hub successfully!");
            self.hubConnected = true;
          }
        }
      } catch (e) {
        log.error("Could not connect to Gizmo Hub.");
        self.hubConnected = false;
      }
    });
  }

  sendChat(source, text, withArrow) {
    const self = this;
    const url = self.getUrl("chat");
    const data = {
      form: {
        hubAccessToken: config.hubAccessToken,
        serverId: config.serverId,
        source: source,
        text: text,
        withArrow: withArrow
      }
    };

    request.post(url, data, (error, response, body) => {
      try {
        const data = JSON.parse(body);

        if (data.status === "error") console.log(data);

        // TODO - Do something with this?
      } catch (e) {
        log.error("Could not send message to hub.");
      }
    });
  }

  sendPrivateMessage(source, target, text) {
    const self = this;
    const url = self.getUrl("privateMessage");
    const data = {
      form: {
        hubAccessToken: config.hubAccessToken,
        source: Utils.formatUsername(source.username),
        target: Utils.formatUsername(target),
        text: text
      }
    };

    request.post(url, data, (error, response, body) => {
      try {
        const data = JSON.parse(body);

        if (data.error) {
          source.notify(`Player @aquamarine@${target}@white@ is not online.`);
          return;
        }

        // No error has occurred.

        // TODO - Add chat colours/format to config.
        source.chat(`[To ${target}]`, text, "aquamarine");
      } catch (e) {
        log.error("Could not send privateMessage to hub.");
      }
    });
  }

  verifyToken(token) {
    return token === config.accessToken;
  }

  getPlayerData(player) {
    const self = this;

    if (!player) return {};

    return {
      serverId: config.serverId,
      x: player.x,
      y: player.y,
      experience: player.experience,
      level: player.level,
      hitPoints: player.hitPoints,
      mana: player.mana,
      pvpKills: player.pvpKills,
      orientation: player.orientation,
      lastLogin: player.lastLogin,
      mapVersion: player.mapVersion
    };
  }

  getUrl(path) {
    return `http://${config.hubHost}:${config.hubPort}/${path}`;
  }

  returnError(response, error, message) {
    response.json({
      error: error,
      message: message
    });
  }
}

module.exports = API;
