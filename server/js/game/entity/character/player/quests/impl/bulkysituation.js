/* global module */

const Quest = require("../quest");
const Packets = require("../../../../../../network/packets");
const Messages = require("../../../../../../network/messages");

class BulkySituation extends Quest {
  constructor(player, data) {
    super(player, data);

    this.player = player;
    this.data = data;

    this.lastNPC = null;
  }

  load(stage) {
    super.load(stage);

    if (this.stage > 9998) return;

    this.loadCallbacks();
  }

  loadCallbacks() {
    this.onNPCTalk(npc => {
      if (this.hasRequirement()) {
        this.progress("item");
        return;
      }

      const conversation = this.getConversation(npc.id);

      this.lastNPC = npc;

      this.player.send(
        new Messages.NPC(Packets.NPCOpcode.Talk, {
          id: npc.instance,
          text: npc.talk(conversation, this.player)
        })
      );

      if (this.player.talkIndex === 0) this.progress("talk");
    });
  }

  progress(type) {
    const task = this.data.task[this.stage];

    if (!task || task !== type) return;

    if (this.stage === this.data.stages) {
      this.finish();
      return;
    }

    switch (type) {
      case "item":
        this.player.inventory.remove(this.getItem(), 1);

        break;
    }

    this.resetTalkIndex();

    this.stage++;

    this.player.send(
      new Messages.Quest(Packets.QuestOpcode.Progress, {
        id: this.id,
        stage: this.stage,
        isQuest: true
      })
    );

    this.update();
  }

  finish() {
    super.finish();
  }

  hasRequirement() {
    return (
      this.getTask() === "item" &&
      this.player.inventory.contains(this.getItem())
    );
  }
}

module.exports = BulkySituation;
