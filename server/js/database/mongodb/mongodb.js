/* global module */

const MongoClient = require("mongodb").MongoClient;
const Loader = require("./loader");
const Creator = require("./creator");
const bcrypt = require("bcrypt");
const _ = require("underscore");

class MongoDB {
  constructor(host, port, user, password, database) {
    const self = this;

    self.host = host;
    self.port = port;
    self.user = user;
    self.password = password;
    self.database = database;

    self.loader = new Loader(self);
    self.creator = new Creator(self);

    self.connection = null;
  }

  getDatabase(callback, type) {
    const self = this;
    let url = `mongodb://${self.host}:${self.port}/${self.database}`;

    if (config.mongoAuth) {
      url = `mongodb://${self.user}:${self.password}@${self.host}:${self.port}/${self.database}`;
    }

    const client = new MongoClient(url, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      wtimeout: 5
    });

    if (self.connection) {
      callback(self.connection);
      return;
    }

    client.connect((error, newClient) => {
      if (error) {
        log.error("Could not connect to MongoDB database.");
        log.error(`Error Info: ${error}`);
        return;
      }

      self.connection = newClient.db(self.database);

      callback(self.connection);
    });
  }

  login(player) {
    const self = this;

    self.getDatabase(database => {
      const dataCursor = database
        .collection("player_data")
        .find({ username: player.username });
      const equipmentCursor = database
        .collection("player_equipment")
        .find({ username: player.username });
      const regionsCursor = database
        .collection("player_regions")
        .find({ username: player.username });

      dataCursor.toArray().then(playerData => {
        equipmentCursor.toArray().then(equipmentData => {
          regionsCursor.toArray().then(regionData => {
            if (playerData.length === 0) self.register(player);
            else {
              const playerInfo = playerData[0];
              const equipmentInfo = equipmentData[0];
              const regions = regionData[0];

              playerInfo.armour = equipmentInfo.armour;
              playerInfo.weapon = equipmentInfo.weapon;
              playerInfo.pendant = equipmentInfo.pendant;
              playerInfo.ring = equipmentInfo.ring;
              playerInfo.boots = equipmentInfo.boots;

              player.load(playerInfo);
              player.loadRegions(regions);

              player.intro();
            }
          });
        });
      });
    });
  }

  verify(player, callback) {
    const self = this;

    self.getDatabase(database => {
      const dataCursor = database
        .collection("player_data")
        .find({ username: player.username });

      dataCursor.toArray().then(data => {
        if (data.length === 0) callback({ status: "error" });
        else {
          const info = data[0];

          bcrypt.compare(player.password, info.password, (error, result) => {
            if (error) throw error;

            if (result) callback({ status: "success" });
            else callback({ status: "error" });
          });
        }
      });
    });
  }

  register(player) {
    const self = this;

    self.getDatabase(database => {
      const playerData = database.collection("player_data");
      const cursor = playerData.find({ username: player.username });

      cursor.toArray().then(info => {
        if (info.length === 0) {
          log.notice(
            "No player data found for " + player.username + ". Creating user."
          );

          player.new = true;

          player.load(Creator.getFullData(player));
          player.intro();
        }
      });
    });
  }

  exists(player, callback) {
    const self = this;

    self.getDatabase(database => {
      const playerData = database.collection("player_data");
      const emailCursor = playerData.find({ email: player.email });
      const usernameCursor = playerData.find({ username: player.username });

      log.debug("Looking for - " + player.email + " or " + player.username);

      emailCursor.toArray().then(emailArray => {
        if (emailArray.length === 0) {
          usernameCursor.toArray().then(usernameArray => {
            if (usernameArray.length === 0) callback({ exists: false });
            else callback({ exists: true, type: "user" });
          });
        } else callback({ exists: true, type: "email" });
      });
    });
  }

  delete(player) {
    const self = this;

    self.getDatabase(database => {
      const collections = [
        "player_data",
        "player_equipment",
        "player_inventory",
        "player_abilities",
        "player_bank",
        "player_quests",
        "player_achievements"
      ];

      _.each(collections, col => {
        const collection = database.collection(col);

        collection.deleteOne(
          {
            username: player.username
          },
          (error, result) => {
            if (error) throw error;

            if (result) {
              log.notice("Player " + player.username + " has been deleted.");
            }
          }
        );
      });
    });
  }

  registeredCount(callback) {
    const self = this;

    self.getDatabase(database => {
      const collection = database.collection("player_data");

      collection.countDocuments().then(count => {
        callback(count);
      });
    });
  }

  resetPositions(newX, newY, callback) {
    const self = this;

    self.getDatabase(database => {
      const collection = database.collection("player_data");
      const cursor = collection.find();

      cursor.toArray().then(playerList => {
        _.each(playerList, playerInfo => {
          delete playerInfo._id;

          playerInfo.x = newX;
          playerInfo.y = newY;

          collection.updateOne(
            {
              username: playerInfo.username
            },
            { $set: playerInfo },
            {
              upsert: true
            },
            (error, result) => {
              if (error) throw error;

              if (result) callback("Successfully updated positions.");
            }
          );
        });
      });
    });
  }
}

module.exports = MongoDB;
