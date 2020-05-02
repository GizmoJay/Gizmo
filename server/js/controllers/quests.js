/* global module */

const _ = require("underscore");
const Introduction = require("../game/entity/character/player/quests/impl/introduction");
const BulkySituation = require("../game/entity/character/player/quests/impl/bulkysituation");
const QuestData = require("../../data/quests.json");
const AchievementData = require("../../data/achievements.json");
const Achievement = require("../game/entity/character/player/achievement");

class Quests {
  constructor(player) {
    const self = this;

    self.player = player;

    self.quests = {};
    self.achievements = {};

    self.load();
  }

  load() {
    const self = this;
    let questCount = 0;

    _.each(QuestData, quest => {
      if (questCount === 0) {
        self.quests[quest.id] = new Introduction(self.player, quest);
      } else if (questCount === 1) {
        self.quests[quest.id] = new BulkySituation(self.player, quest);
      }

      questCount++;
    });

    _.each(AchievementData, achievement => {
      self.achievements[achievement.id] = new Achievement(
        achievement.id,
        self.player
      );
    });
  }

  updateQuests(ids, stages) {
    const self = this;

    if (!ids || !stages) {
      _.each(self.quests, quest => {
        quest.load(0);
      });

      return;
    }

    for (let id = 0; id < ids.length; id++) {
      if (!isNaN(parseInt(ids[id])) && self.quests[id]) {
        self.quests[id].load(stages[id]);
      }
    }

    if (self.questsReadyCallback) {
      self.questsReadyCallback();
    }
  }

  updateAchievements(ids, progress) {
    const self = this;

    for (let id = 0; id < ids.length; id++) {
      if (!isNaN(parseInt(ids[id])) && self.achievements[id]) {
        self.achievements[id].setProgress(progress[id], true);
      }
    }

    if (self.achievementsReadyCallback) {
      self.achievementsReadyCallback();
    }
  }

  getQuest(id) {
    const self = this;

    if (id in self.quests) {
      return self.quests[id];
    }

    return null;
  }

  getAchievement(id) {
    const self = this;

    if (!self.achievements || !self.achievements[id]) {
      return null;
    }

    return self.achievements[id];
  }

  getQuests() {
    const self = this;
    let ids = "";
    let stages = "";

    for (let id = 0; id < self.getQuestSize(); id++) {
      var quest = self.quests[id];

      ids += id + " ";
      stages += quest.stage + " ";
    }

    return {
      username: self.player.username,
      ids: ids,
      stages: stages
    };
  }

  getAchievements() {
    const self = this;
    let ids = "";
    let progress = "";

    for (let id = 0; id < self.getAchievementSize(); id++) {
      ids += id + " ";
      progress += self.achievements[id].progress + " ";
    }

    return {
      username: self.player.username,
      ids: ids,
      progress: progress
    };
  }

  getAchievementData() {
    const self = this;
    const achievements = [];

    self.forEachAchievement(achievement => {
      achievements.push(achievement.getInfo());
    });

    return {
      achievements: achievements
    };
  }

  getQuestData() {
    const self = this;
    const quests = [];

    self.forEachQuest(quest => {
      quests.push(quest.getInfo());
    });

    return {
      quests: quests
    };
  }

  forEachQuest(callback) {
    _.each(this.quests, quest => {
      callback(quest);
    });
  }

  forEachAchievement(callback) {
    _.each(this.achievements, achievement => {
      callback(achievement);
    });
  }

  getQuestsCompleted() {
    const self = this;
    let count = 0;

    for (const id in self.quests) {
      if (self.quests.hasOwnProperty(id)) {
        if (self.quests[id].isFinished()) {
          count++;
        }
      }
    }

    return count;
  }

  getAchievementsCompleted() {
    const self = this;
    let count = 0;

    for (const id in self.achievements) {
      if (self.achievements.hasOwnProperty(id)) {
        if (self.achievements[id].isFinished()) {
          count++;
        }
      }
    }

    return count;
  }

  getQuestSize() {
    return Object.keys(this.quests).length;
  }

  getAchievementSize() {
    return Object.keys(this.achievements).length;
  }

  getQuestByNPC(npc) {
    const self = this;

    /**
     * Iterate through the quest list in the order it has been
     * added so that NPC's that are required by multiple quests
     * follow the proper order.
     */

    for (const id in self.quests) {
      if (self.quests.hasOwnProperty(id)) {
        const quest = self.quests[id];

        if (quest.hasNPC(npc.id)) {
          return quest;
        }
      }
    }

    return null;
  }

  getAchievementByNPC(npc) {
    const self = this;

    for (const id in self.achievements) {
      if (self.achievements.hasOwnProperty(id)) {
        if (
          self.achievements[id].data.npc === npc.id &&
          !self.achievements[id].isFinished()
        ) {
          return self.achievements[id];
        }
      }
    }

    return null;
  }

  getAchievementByMob(mob) {
    const self = this;

    for (const id in self.achievements) {
      if (self.achievements.hasOwnProperty(id)) {
        if (self.achievements[id].data.mob === mob.id) {
          return self.achievements[id];
        }
      }
    }

    return null;
  }

  isQuestMob(mob) {
    const self = this;

    if (mob.type !== "mob") {
      return false;
    }

    for (const id in self.quests) {
      if (self.quests.hasOwnProperty(id)) {
        const quest = self.quests[id];

        if (!quest.isFinished() && quest.hasMob(mob.id)) {
          return true;
        }
      }
    }

    return false;
  }

  isAchievementMob(mob) {
    const self = this;

    if (mob.type !== "mob") {
      return false;
    }

    for (const id in self.achievements) {
      if (self.achievements.hasOwnProperty(id)) {
        if (
          self.achievements[id].data.mob === mob.id &&
          !self.achievements[id].isFinished()
        ) {
          return true;
        }
      }
    }

    return false;
  }

  isQuestNPC(npc) {
    const self = this;

    if (npc.type !== "npc") {
      return false;
    }

    for (const id in self.quests) {
      if (self.quests.hasOwnProperty(id)) {
        const quest = self.quests[id];

        if (!quest.isFinished() && quest.hasNPC(npc.id)) {
          return true;
        }
      }
    }

    return false;
  }

  isAchievementNPC(npc) {
    const self = this;

    if (npc.type !== "npc") {
      return false;
    }

    for (const id in self.achievements) {
      if (self.achievements.hasOwnProperty(id)) {
        if (
          self.achievements[id].data.npc === npc.id &&
          !self.achievements[id].isFinished()
        ) {
          return true;
        }
      }
    }

    return false;
  }

  onAchievementsReady(callback) {
    this.achievementsReadyCallback = callback;
  }

  onQuestsReady(callback) {
    this.questsReadyCallback = callback;
  }
}

module.exports = Quests;
