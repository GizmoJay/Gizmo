/* global module */

const Entity = require("../entity");

class NPC extends Entity {
  constructor(id, instance, x, y) {
    super(id, "npc", instance, x, y);

    this.talkIndex = 0;
  }

  talk(messages, player) {
    const self = this;

    if (!player) {
      return;
    }

    if (player.npcTalk !== self.id) {
      player.talkIndex = 0;
      player.npcTalk = self.id;
    }

    const message = messages[player.talkIndex];

    if (player.talkIndex > messages.length - 1) {
      player.talkIndex = 0;
    } else {
      player.talkIndex++;
    }

    return message;
  }
}

module.exports = NPC;
