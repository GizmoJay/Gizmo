const Objects = require("../util/objects");
const Utils = require("../util/utils");

class GlobalObjects {
  constructor(world) {
    const self = this;

    self.world = world;
    self.map = world.map;
  }

  getInfo(id) {
    const self = this;
    const position = Objects.getPosition(id);
    const objectId = self.map.getPositionObject(position.x, position.y);

    if (objectId in self.map.trees) {
      return {
        type: "lumberjacking",
        tree: self.map.trees[objectId]
      };
    }

    const object = Objects.getObject(id);

    if (!object) return null;

    return {
      type: object.type
    };
  }

  /**
   * Used for objects that display text bubbles. Returns formatted
   * position data for the client to display the bubble.
   */

  getSignData(id) {
    const self = this;
    const object = Objects.getObject(id);

    if (!object) return null;

    const position = Objects.getPosition(id);

    object.id = id;

    return {
      object: object,
      info: {
        id: id,
        x: position.x * 16,
        y: position.y * 16 + 8 // offset for the chat bubble
      }
    };
  }

  /**
   * Ripped from `npc.js` but with some minor adjustments.
   */

  talk(object, player) {
    const self = this;

    if (player.npcTalk !== object.id) {
      player.npcTalk = object.id;
      player.talkIndex = 0;
    }

    let message = object.messages[player.talkIndex];

    if (message && message.includes("@player@")) {
      message = message.replace(
        "@player@",
        "@red@" + Utils.formatUsername(player.username)
      );
      message = Utils.parseMessage(message);
    }

    if (player.talkIndex > object.messages.length - 1) player.talkIndex = 0;
    else player.talkIndex++;

    return message;
  }
}

module.exports = GlobalObjects;
