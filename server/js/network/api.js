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
    this.world = world;

    if (!config.apiEnabled) return;

    const app = express();

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    const router = express.Router();

    this.handle(router);

    app.use("/", router);

    app.listen(config.apiPort, () => {
      log.notice(config.name + " API has successfully initialized.");
    });
  }

  handle(router) {
    router.get("/", (request, response) => {
      response.json({
        name: config.name,
        port: config.port, // Sends the server port.
        gameVersion: config.gver,
        maxPlayers: config.maxPlayers,
        playerCount: this.world.getPopulation()
      });
    });

    router.post("/player", (request, response) => {
      this.handlePlayer(request, response);
    });

    router.post("/chat", (request, response) => {
      this.handleChat(request, response);
    });

    router.get("/players", (request, response) => {
      this.handlePlayers(request, response);
    });
  }

  handlePlayer(request, response) {
    if (!this.verifyToken(request.body.accessToken)) {
      this.returnError(
        response,
        APIConstants.MALFORMED_PARAMETERS,
        "Invalid `accessToken` specified for /player POST request."
      );
      return;
    }

    const username = request.body.username;

    if (!username) {
      this.returnError(
        response,
        APIConstants.MALFORMED_PARAMETERS,
        "No `username` variable received."
      );
      return;
    }

    if (!this.world.isOnline(username)) {
      this.returnError(
        response,
        APIConstants.PLAYER_NOT_ONLINE,
        `Player ${username} is not online.`
      );
      return;
    }

    const player = this.world.getPlayerByName(username);

    response.json(this.getPlayerData(player));
  }

  handleChat(request, response) {
    if (!this.verifyToken(request.body.accessToken)) {
      this.returnError(
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
      const player = this.world.getPlayerByName(username);

      if (player) player.chat(source, text, colour);

      response.json({ status: "success" });

      return;
    }

    this.world.globalMessage(source, text, colour);

    response.json({ status: "success" });
  }

  handlePlayers(request, response) {
    if (!this.verifyToken(request.query.accessToken)) {
      this.returnError(
        response,
        APIConstants.MALFORMED_PARAMETERS,
        "Invalid `accessToken` specified for /players GET request."
      );
      return;
    }

    const players = {};

    _.each(this.world.players, player => {
      players[player.email] = this.getPlayerData(player);
    });

    response.json(players);
  }

  pingHub() {
    const url = this.getUrl("ping");
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
          if (!this.hubConnected) {
            log.notice("Connected to Gizmo Hub successfully!");
            this.hubConnected = true;
          }
        }
      } catch (e) {
        log.error("Could not connect to Gizmo Hub.", error);
        this.hubConnected = false;
      }
    });
  }

  sendChat(source, text, withArrow) {
    const url = this.getUrl("chat");
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

        if (data.status === "error") console.error(data, error);

        // TODO - Do something with this?
      } catch (e) {
        log.error("Could not send message to hub.", error);
      }
    });
  }

  sendPrivateMessage(source, target, text) {
    const url = this.getUrl("privateMessage");
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
        log.error("Could not send privateMessage to hub.", error);
      }
    });
  }

  verifyToken(token) {
    return token === config.accessToken;
  }

  getPlayerData(player) {
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
