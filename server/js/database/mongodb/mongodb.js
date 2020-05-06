/* global module */

const MongoClient = require("mongodb").MongoClient;
const Loader = require("./loader");
const Creator = require("./creator");
const bcrypt = require("bcrypt");
const _ = require("underscore");

class MongoDB {
  constructor(host, port, user, password, database) {
    this.host = host;
    this.port = port;
    this.user = user;
    this.password = password;
    this.database = database;

    this.loader = new Loader(this);
    this.creator = new Creator(this);

    this.connection = null;
  }

  getDatabase(callback, type) {
    let url = `mongodb://${this.host}:${this.port}/${this.database}`;

    if (config.mongoAuth) {
      url = `mongodb://${this.user}:${this.password}@${this.host}:${this.port}/${this.database}`;
    }

    const client = new MongoClient(url, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      wtimeout: 5
    });

    if (this.connection) {
      callback(this.connection);
      return;
    }

    client.connect((error, newClient) => {
      if (error) {
        log.error("Could not connect to MongoDB database.");
        log.error(`Error Info: ${error}`);
        return;
      }

      this.connection = newClient.db(this.database);

      callback(this.connection);
    });
  }

  login(player) {
    this.getDatabase(database => {
      const dataCursor = database
        .collection("player_data")
        .find({ email: player.email });
      const equipmentCursor = database
        .collection("player_equipment")
        .find({ email: player.email });
      const regionsCursor = database
        .collection("player_regions")
        .find({ email: player.email });

      dataCursor.toArray().then(playerData => {
        equipmentCursor.toArray().then(equipmentData => {
          regionsCursor.toArray().then(regionData => {
            if (playerData.length === 0) this.register(player);
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
    this.getDatabase(database => {
      const dataCursor = database
        .collection("player_data")
        .find({ email: player.email });

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
    this.getDatabase(database => {
      const playerData = database.collection("player_data");
      const cursor = playerData.find({ email: player.email });

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
    this.getDatabase(database => {
      const playerData = database.collection("player_data");
      const emailCursor = playerData.find({ email: player.email });

      log.debug(`Looking for - ${player.email}`);

      emailCursor.toArray().then(emailArray => {
        if (emailArray.length !== 0) callback({ exists: true, type: "email" });
        else callback({ exists: false });
      });
    });
  }

  delete(player) {
    this.getDatabase(database => {
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
            email: player.email
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
    this.getDatabase(database => {
      const collection = database.collection("player_data");

      collection.countDocuments().then(count => {
        callback(count);
      });
    });
  }

  resetPositions(newX, newY, callback) {
    this.getDatabase(database => {
      const collection = database.collection("player_data");
      const cursor = collection.find();

      cursor.toArray().then(playerList => {
        _.each(playerList, playerInfo => {
          delete playerInfo._id;

          playerInfo.x = newX;
          playerInfo.y = newY;

          collection.updateOne(
            {
              email: playerInfo.email
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
