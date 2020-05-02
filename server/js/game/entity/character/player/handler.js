/* global module */

const _ = require("underscore");
const Messages = require("../../../../network/messages");
const Modules = require("../../../../util/modules");
const Packets = require("../../../../network/packets");
const Npcs = require("../../../../util/npcs");
const Hit = require("../combat/hit");
const Utils = require("../../../../util/utils");
const Shops = require("../../../../util/shops");

class Handler {
  constructor(player) {
    const self = this;

    self.player = player;
    self.world = player.world;
    self.map = player.world.map;

    self.updateTicks = 0;
    self.updateInterval = null;

    self.load();
  }

  destroy() {
    const self = this;

    clearInterval(self.updateInterval);
    self.updateInterval = null;
  }

  load() {
    const self = this;

    self.updateInterval = setInterval(() => {
      self.detectAggro();
      self.detectPVP(self.player.x, self.player.y);

      if (self.updateTicks % 4 === 0) {
        // Every 4 (1.6 seconds) update ticks.
        self.handlePoison();
      }

      if (self.updateTicks % 16 === 0) {
        // Every 16 (6.4 seconds) update ticks.
        self.player.cheatScore = 0;
      }

      if (self.updateTicks > 100) {
        // Reset them every now and then.
        self.updateTicks = 0;
      }

      self.updateTicks++;
    }, 400);

    self.player.onMovement((x, y) => {
      self.player.checkRegions();

      self.detectMusic(x, y);
      self.detectOverlay(x, y);
      self.detectCamera(x, y);
      self.detectLights(x, y);
      self.detectClipping(x, y);
    });

    self.player.onDeath(() => {
      self.player.combat.stop();
    });

    self.player.onHit((attacker, damage) => {
      /**
       * Handles actions whenever the player
       * instance is hit by 'damage' amount
       */

      if (self.player.combat.isRetaliating()) {
        self.player.combat.begin(attacker);
      }
    });

    self.player.onKill(character => {
      if (self.player.quests.isAchievementMob(character)) {
        const achievement = self.player.quests.getAchievementByMob(character);

        if (achievement && achievement.isStarted()) {
          self.player.quests.getAchievementByMob(character).step();
        }
      }
    });

    self.player.onRegion(() => {
      self.player.lastRegionChange = new Date().getTime();

      self.world.region.handle(self.player);
      self.world.region.push(self.player);
    });

    self.player.connection.onClose(() => {
      self.player.stopHealing();

      /* Avoid a memory leak */
      clearInterval(self.updateInterval);
      self.updateInterval = null;

      if (self.player.ready) {
        if (config.hubEnabled) {
          self.world.api.sendChat(
            Utils.formatUsername(self.player.username),
            "has logged out!"
          );
        }
      }

      self.world.removePlayer(self.player);
    });

    self.player.onTalkToNPC(npc => {
      if (self.player.quests.isQuestNPC(npc)) {
        self.player.quests.getQuestByNPC(npc).triggerTalk(npc);

        return;
      }

      if (self.player.quests.isAchievementNPC(npc)) {
        self.player.quests.getAchievementByNPC(npc).converse(npc);

        return;
      }

      if (Shops.isShopNPC(npc.id)) {
        self.world.shops.open(self.player, npc.id);
        return;
      }

      switch (Npcs.getType(npc.id)) {
        case "banker":
          self.player.send(new Messages.NPC(Packets.NPCOpcode.Bank, {}));
          return;

        case "enchanter":
          self.player.send(new Messages.NPC(Packets.NPCOpcode.Enchant, {}));
          break;
      }

      const text = Npcs.getText(npc.id);

      if (!text) {
        return;
      }

      self.player.send(
        new Messages.NPC(Packets.NPCOpcode.Talk, {
          id: npc.instance,
          text: npc.talk(text, self.player)
        })
      );
    });

    self.player.onTeleport((x, y, isDoor) => {
      if (
        !self.player.finishedTutorial() &&
        isDoor &&
        self.player.doorCallback
      ) {
        self.player.doorCallback(x, y);
      }
    });

    self.player.onPoison(info => {
      self.player.sync();

      if (info) {
        self.player.notify("You have been poisoned.");
      } else {
        self.player.notify("The poison has worn off.");
      }

      log.debug(`Player ${self.player.instance} updated poison status.`);
    });

    self.player.onCheatScore(() => {
      /**
       * This is a primitive anti-cheating system.
       * It will not accomplish much, but it is enough for now.
       */

      if (self.player.cheatScore > 10) {
        self.player.timeout();
      }

      log.debug("Cheat score - " + self.player.cheatScore);
    });
  }

  detectAggro() {
    const self = this;
    const region = self.world.region.regions[self.player.region];

    if (!region) {
      return;
    }

    _.each(region.entities, entity => {
      if (entity && entity.type === "mob" && self.canEntitySee(entity)) {
        const aggro = entity.canAggro(self.player);

        if (aggro) {
          entity.combat.begin(self.player);
        }
      }
    });
  }

  detectMusic(x, y) {
    const self = this;
    const musicArea = _.find(self.world.getMusicAreas(), area => {
      return area.contains(x, y);
    });
    const song = musicArea ? musicArea.id : null;

    if (self.player.currentSong !== song) {
      self.player.updateMusic(song);
    }
  }

  detectPVP(x, y) {
    const self = this;
    const pvpArea = _.find(self.world.getPVPAreas(), area => {
      return area.contains(x, y);
    });

    self.player.updatePVP(!!pvpArea);
  }

  detectOverlay(x, y) {
    const self = this;
    const overlayArea = _.find(self.world.getOverlayAreas(), area => {
      return area.contains(x, y);
    });

    self.player.updateOverlay(overlayArea);
  }

  detectCamera(x, y) {
    const self = this;
    const cameraArea = _.find(self.world.getCameraAreas(), area => {
      return area.contains(x, y);
    });

    self.player.updateCamera(cameraArea);
  }

  detectLights(x, y) {
    const self = this;

    _.each(self.map.lights, light => {
      if (
        self.map.nearLight(light, x, y) &&
        !self.player.hasLoadedLight(light)
      ) {
        // Add a half a tile offset so the light is centered on the tile.

        self.player.lightsLoaded.push(light);
        self.player.send(
          new Messages.Overlay(Packets.OverlayOpcode.Lamp, light)
        );
      }
    });
  }

  detectClipping(x, y) {
    const self = this;
    const isColliding = self.map.isColliding(x, y);

    if (!isColliding) {
      return;
    }

    self.player.incoming.handleNoClip(x, y);
  }

  handlePoison() {
    const self = this;

    if (!self.player.poison) {
      return;
    }

    const info = self.player.poison.split(":");
    const timeDiff = new Date().getTime() - info[0];

    if (timeDiff > info[1]) {
      self.player.setPoison(false);
      return;
    }

    const hit = new Hit(Modules.Hits.Poison, info[2]);

    hit.poison = true;

    self.player.combat.hit(self.player, self.player, hit.getData());
  }

  canEntitySee(entity) {
    return (
      !this.player.hasInvisible(entity) &&
      !this.player.hasInvisibleId(entity.id)
    );
  }
}

module.exports = Handler;
