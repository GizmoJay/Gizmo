/* global module */

class Loader {
  constructor(database) {
    this.database = database;
  }

  getInventory(player, callback) {
    this.database.getDatabase(database => {
      const inventory = database.collection("player_inventory");
      const cursor = inventory.find({ email: player.email });

      cursor.toArray().then(inventoryArray => {
        const info = inventoryArray[0];

        if (info) {
          if (info.username !== player.username) {
            log.notice(
              "[Loader] Mismatch in usernames whilst retrieving inventory data for: " +
                player.username
            );
          }

          callback(
            info.ids.split(" "),
            info.counts.split(" "),
            info.abilities.split(" "),
            info.abilityLevels.split(" ")
          );
        } else callback(null, null, null, null);
      });
    });
  }

  getBank(player, callback) {
    this.database.getDatabase(database => {
      const bank = database.collection("player_bank");
      const cursor = bank.find({ email: player.email });

      cursor.toArray().then(bankArray => {
        const info = bankArray[0];

        if (info) {
          if (info.username !== player.username) {
            log.notice(
              "[Loader] Mismatch in usernames whilst retrieving bank data for: " +
                player.username
            );
          }

          callback(
            info.ids.split(" "),
            info.counts.split(" "),
            info.abilities.split(" "),
            info.abilityLevels.split(" ")
          );
        }
      });
    });
  }

  getQuests(player, callback) {
    this.database.getDatabase(database => {
      const quests = database.collection("player_quests");
      const cursor = quests.find({ email: player.email });

      cursor.toArray().then(questArray => {
        const info = questArray[0];

        if (info) {
          if (info.username !== player.username) {
            log.notice(
              "[Loader] Mismatch in usernames whilst retrieving quest data for: " +
                player.username
            );
          }

          callback(info.ids.split(" "), info.stages.split(" "));
        } else callback(null, null);
      });
    });
  }

  getAchievements(player, callback) {
    this.database.getDatabase(database => {
      const achievements = database.collection("player_achievements");
      const cursor = achievements.find({ email: player.email });

      cursor.toArray().then(achievementsArray => {
        const info = achievementsArray[0];

        if (info) {
          if (info.username !== player.username) {
            log.notice(
              "[Loader] Mismatch in usernames whilst retrieving achievement data for: " +
                player.username
            );
          }

          callback(info.ids.split(" "), info.progress.split(" "));
        }
      });
    });
  }

  getProfessions(player, callback) {
    this.database.getDatabase(database => {
      const professions = database.collection("player_professions");
      const cursor = professions.find({ email: player.email });

      cursor.toArray().then(professionsArray => {
        const info = professionsArray[0];

        if (info && info.data) {
          if (info.username !== player.username) {
            log.notice(
              "[Loader] Mismatch in usernames whilst retrieving profession data for: " +
                player.username
            );
          }

          callback(info.data);
        }
      });
    });
  }
}

module.exports = Loader;
