/* global module */

const _ = require("underscore");
const Player = require("./entity/character/player/player");
const Map = require("../map/map");
const Messages = require("../network/messages");
const Utils = require("../util/utils");
const Mobs = require("../util/mobs");
const Mob = require("./entity/character/mob/mob");
const NPCs = require("../util/npcs");
const NPC = require("./entity/npc/npc");
const Items = require("../util/items");
const Item = require("./entity/objects/item");
const Chest = require("./entity/objects/chest");
const Character = require("./entity/character/character");
const Projectile = require("./entity/objects/projectile");
const Minigames = require("../controllers/minigames");
const Packets = require("../network/packets");
const Formulas = require("../util/formulas");
const Modules = require("../util/modules");
const Shops = require("../controllers/shops");
const Region = require("../region/region");
const GlobalObjects = require("../controllers/globalobjects");
const Network = require("../network/network");
const API = require("../network/api");

class World {
  constructor(socket, database) {
    const self = this;

    self.socket = socket;
    self.database = database;

    self.maxPlayers = config.maxPlayers;
    self.updateTime = config.updateTime;

    self.debug = false;
    self.allowConnections = false;

    self.players = {};
    self.entities = {};
    self.items = {};
    self.chests = {};
    self.mobs = {};
    self.npcs = {};
    self.projectiles = {};

    self.loadedRegions = false;

    self.ready = false;

    self.malformTimeout = null;
  }

  load(onWorldLoad) {
    const self = this;

    log.info("************ World Information ***********");

    /**
     * The reason maps are loaded per each world is because
     * we can have slight modifications for each world if we want in the
     * future. Using region loading, we can just send the client
     * whatever new map we have created server sided. Cleaner and nicer.
     */

    self.map = new Map(self);
    self.map.isReady(() => {
      log.info("The map has been successfully loaded!");

      self.loaded();

      self.spawnChests();
      self.spawnEntities();

      setTimeout(onWorldLoad, 100);
    });
  }

  loaded() {
    const self = this;

    /**
     * The following are all globally based 'plugins'. We load them
     * in a batch here in order to keep it organized and neat.
     */

    self.minigames = new Minigames(self);

    self.api = new API(self);
    self.shops = new Shops(self);
    self.region = new Region(self);
    self.network = new Network(self);
    self.globalObjects = new GlobalObjects(self);

    self.ready = true;

    self.tick();

    log.info("******************************************");
  }

  async tick() {
    const self = this;
    const update = 1000 / self.updateTime;

    const setIntervalAsync = (fn, ms) => {
      fn().then(() => {
        setTimeout(() => setIntervalAsync(fn, ms), ms);
      });
    };

    setIntervalAsync(async() => {
      self.network.parsePackets();
      self.region.parseRegions();
    }, update);

    if (!config.hubEnabled) {
      return;
    }

    if (!config.apiEnabled) {
      log.warning("Server is in hub-mode but API is not enabled!");
    }

    setIntervalAsync(async() => {
      self.api.pingHub();
    }, config.hubPing);
  }

  /****************************
   * Entity related functions *
   ****************************/

  kill(entity) {
    const self = this;

    entity.applyDamage(entity.hitPoints);

    self.push(Packets.PushOpcode.Regions, [
      {
        regionId: entity.region,
        message: new Messages.Points({
          id: entity.instance,
          hitPoints: entity.getHitPoints(),
          mana: null
        })
      },
      {
        regionId: entity.region,
        message: new Messages.Despawn(entity.instance)
      }
    ]);

    self.handleDeath(entity, true);
  }

  handleDamage(attacker, target, damage) {
    const self = this;

    if (!attacker || !target || isNaN(damage) || target.invincible) {
      return;
    }

    if (target.type === "player" && target.hitCallback) {
      target.hitCallback(attacker, damage);
    }

    // Stop screwing with this - it's so the target retaliates.

    target.hit(attacker);
    target.applyDamage(damage, attacker);

    self.push(Packets.PushOpcode.Regions, {
      regionId: target.region,
      message: new Messages.Points({
        id: target.instance,
        hitPoints: target.getHitPoints(),
        mana: null
      })
    });

    // If target has died...
    if (target.getHitPoints() < 1) {
      if (target.type === "mob") {
        attacker.addExperience(Mobs.getXp(target.id));
      }

      if (attacker.type === "player") {
        attacker.killCharacter(target);
      }

      target.combat.forEachAttacker(attacker => {
        attacker.removeTarget();
      });

      self.push(Packets.PushOpcode.Regions, [
        {
          regionId: target.region,
          message: new Messages.Combat(Packets.CombatOpcode.Finish, {
            attackerId: attacker.instance,
            targetId: target.instance
          })
        },
        {
          regionId: target.region,
          message: new Messages.Despawn(target.instance)
        }
      ]);

      self.handleDeath(target, false, attacker);
    }
  }

  handleDeath(character, ignoreDrops, lastAttacker) {
    const self = this;

    if (!character) {
      return;
    }

    if (character.type === "mob") {
      const deathX = character.x;
      const deathY = character.y;

      if (lastAttacker) {
        character.lastAttacker = lastAttacker;
      }

      if (character.deathCallback) {
        character.deathCallback();
      }

      self.removeEntity(character);

      character.dead = true;

      character.destroy();

      character.combat.stop();

      if (!ignoreDrops) {
        const drop = character.getDrop();

        if (drop) {
          self.dropItem(drop.id, drop.count, deathX, deathY);
        }
      }
    } else if (character.type === "player") {
      character.die();
    }
  }

  createProjectile(info) {
    const self = this;
    const attacker = info.shift();
    const target = info.shift();

    if (!attacker || !target) {
      return null;
    }

    const startX = attacker.x;
    const startY = attacker.y;
    const type = attacker.getProjectile();
    let hit = null;
    const projectile = new Projectile(type, Utils.generateInstance());

    projectile.setStart(startX, startY);
    projectile.setTarget(target);

    if (attacker.type === "player") {
      hit = attacker.getHit(target);
    }

    projectile.damage = hit
      ? hit.damage
      : Formulas.getDamage(attacker, target, true);
    projectile.hitType = hit ? hit.type : Modules.Hits.Damage;

    projectile.owner = attacker;

    self.addProjectile(projectile, projectile.owner.region);

    return projectile;
  }

  getEntityByInstance(instance) {
    if (instance in this.entities) {
      return this.entities[instance];
    }
  }

  spawnEntities() {
    const self = this;
    let entities = 0;

    _.each(self.map.staticEntities, data => {
      const key = data.string;
      const isMob = !!Mobs.Properties[key];
      const isNpc = !!NPCs.Properties[key];
      const isItem = !!Items.Data[key];
      const info = isMob
        ? Mobs.Properties[key]
        : isNpc
          ? NPCs.Properties[key]
          : isItem
            ? Items.getData(key)
            : null;
      const position = self.map.indexToGridPosition(data.tileIndex);

      position.x++;

      if (!info || info === "null") {
        if (self.debug) {
          log.info(
            "Unknown object spawned at: " + position.x + " " + position.y
          );
        }

        return;
      }

      const instance = Utils.generateInstance();

      if (isMob) {
        const mob = new Mob(info.id, instance, position.x, position.y, self);

        mob.static = true;

        if (data.roaming) {
          mob.roaming = true;
        }

        if (data.miniboss) {
          if (data.achievementId) {
            mob.achievementId = data.achievementId;
          }

          mob.miniboss = data.miniboss;
        }

        if (data.boss) {
          mob.boss = data.boss;
        }

        if (Mobs.Properties[key].hiddenName) {
          mob.hiddenName = Mobs.Properties[key].hiddenName;
        }

        mob.load();

        mob.onRespawn(() => {
          mob.dead = false;

          mob.lastAttacker = null;

          mob.refresh();

          self.addMob(mob);
        });

        self.addMob(mob);
      }

      if (isNpc) {
        self.addNPC(new NPC(info.id, instance, position.x, position.y));
      }

      if (isItem) {
        const item = self.createItem(info.id, instance, position.x, position.y);
        item.static = true;
        self.addItem(item);
      }

      entities++;
    });

    log.info("Spawned " + Object.keys(self.entities).length + " entities!");
  }

  spawnChests() {
    const self = this;
    let chests = 0;

    _.each(self.map.chests, info => {
      self.spawnChest(info.i, info.x, info.y, true);

      chests++;
    });

    log.info("Spawned " + Object.keys(self.chests).length + " static chests");
  }

  spawnMob(id, x, y) {
    const self = this;
    const mob = new Mob(id, Utils.generateInstance(), x, y);

    if (!Mobs.exists(id)) {
      return;
    }

    self.addMob(mob);

    return mob;
  }

  spawnChest(items, x, y, staticChest) {
    const self = this;
    const chestCount = Object.keys(self.chests).length;
    const chest = new Chest(194, Utils.generateInstance(), x, y);

    chest.items = items;

    if (staticChest) {
      chest.static = staticChest;

      chest.onRespawn(self.addChest.bind(self, chest));
    }

    chest.onOpen(() => {
      /**
       * Pretty simple concept, detect when the player opens the chest
       * then remove it and drop an item instead. Give it a 25 second
       * cooldown prior to respawning and voila.
       */

      self.removeChest(chest);

      if (config.debug) {
        log.info(`Opening chest at x: ${chest.x}, y: ${chest.y}`);
      }

      const item = chest.getItem();

      if (!item) {
        return;
      }

      self.dropItem(
        Items.stringToId(item.string),
        item.count,
        chest.x,
        chest.y
      );
    });

    self.addChest(chest);

    return chest;
  }

  createItem(id, instance, x, y, ability, abilityLevel) {
    return new Item(id, instance, x, y, ability, abilityLevel);
  }

  dropItem(id, count, x, y, ability, abilityLevel) {
    const self = this;
    const item = self.createItem(
      id,
      Utils.generateInstance(),
      x,
      y,
      ability,
      abilityLevel
    );

    item.count = count;
    item.dropped = true;

    self.addItem(item);
    item.despawn();

    if (config.debug) {
      log.info(`Item - ${id} has been dropped at x: ${x}, y: ${y}.`);
      log.info(`Item Region - ${item.region}`);
    }

    item.onBlink(() => {
      self.push(Packets.PushOpcode.Broadcast, {
        message: new Messages.Blink(item.instance)
      });
    });

    item.onDespawn(() => {
      self.removeItem(item);
    });
  }

  push(type, info) {
    const self = this;

    if (_.isArray(info)) {
      _.each(info, i => {
        self.push(type, i);
      });
      return;
    }

    if (!info.message) {
      log.info("No message found whilst attempting to push.");
      log.info(info);
      return;
    }

    switch (type) {
      case Packets.PushOpcode.Broadcast:
        self.network.pushBroadcast(info.message);

        break;

      case Packets.PushOpcode.Selectively:
        self.network.pushSelectively(info.message, info.ignores);

        break;

      case Packets.PushOpcode.Player:
        self.network.pushToPlayer(info.player, info.message);

        break;

      case Packets.PushOpcode.Players:
        self.network.pushToPlayers(info.players, info.message);

        break;

      case Packets.PushOpcode.Region:
        self.network.pushToRegion(info.regionId, info.message, info.ignoreId);

        break;

      case Packets.PushOpcode.Regions:
        self.network.pushToAdjacentRegions(
          info.regionId,
          info.message,
          info.ignoreId
        );

        break;

      case Packets.PushOpcode.NameArray:
        self.network.pushToNameArray(info.names, info.message);

        break;

      case Packets.PushOpcode.OldRegions:
        self.network.pushToOldRegions(info.player, info.message);

        break;
    }
  }

  addEntity(entity, region) {
    const self = this;

    if (entity.instance in self.entities) {
      log.info("Entity " + entity.instance + " already exists.");
    }

    self.entities[entity.instance] = entity;

    if (entity.type !== "projectile") {
      self.region.handle(entity, region);
    }

    if (entity.x > 0 && entity.y > 0) {
      self.getGrids().addToEntityGrid(entity, entity.x, entity.y);
    }

    entity.onSetPosition(() => {
      self.getGrids().updateEntityPosition(entity);

      if (entity.isMob() && entity.isOutsideSpawn()) {
        entity.removeTarget();
        entity.combat.forget();
        entity.combat.stop();

        entity.return();

        self.push(Packets.PushOpcode.Broadcast, [
          {
            message: new Messages.Combat(Packets.CombatOpcode.Finish, {
              attackerId: null,
              targetId: entity.instance
            })
          },
          {
            message: new Messages.Movement(Packets.MovementOpcode.Move, {
              id: entity.instance,
              x: entity.x,
              y: entity.y,
              forced: false,
              teleport: false
            })
          }
        ]);
      }
    });

    if (entity instanceof Character) {
      entity.getCombat().setWorld(self);

      entity.onStunned(stun => {
        self.push(Packets.PushOpcode.Regions, {
          regionId: entity.region,
          message: new Messages.Movement(Packets.MovementOpcode.Stunned, {
            id: entity.instance,
            state: stun
          })
        });
      });
    }
  }

  addPlayer(player) {
    const self = this;

    self.addEntity(player);
    self.players[player.instance] = player;

    if (self.populationCallback) {
      self.populationCallback();
    }
  }

  addNPC(npc, region) {
    const self = this;

    self.addEntity(npc, region);
    self.npcs[npc.instance] = npc;
  }

  addMob(mob, region) {
    const self = this;

    if (!Mobs.exists(mob.id)) {
      log.error("Cannot spawn mob. " + mob.id + " does not exist.");
      return;
    }

    self.addEntity(mob, region);
    self.mobs[mob.instance] = mob;

    mob.addToChestArea(self.getChestAreas());

    mob.onHit(attacker => {
      if (mob.isDead() || mob.combat.started) {
        return;
      }

      mob.combat.begin(attacker);
    });
  }

  addItem(item, region) {
    const self = this;

    if (item.static) {
      item.onRespawn(self.addItem.bind(self, item));
    }

    self.addEntity(item, region);
    self.items[item.instance] = item;
  }

  addProjectile(projectile, region) {
    const self = this;

    self.addEntity(projectile, region);
    self.projectiles[projectile.instance] = projectile;
  }

  addChest(chest, region) {
    const self = this;

    self.addEntity(chest, region);
    self.chests[chest.instance] = chest;
  }

  removeEntity(entity) {
    const self = this;

    if (entity.instance in self.entities) {
      delete self.entities[entity.instance];
    }

    if (entity.instance in self.mobs) {
      delete self.mobs[entity.instance];
    }

    if (entity.instance in self.items) {
      delete self.items[entity.instance];
    }

    self.getGrids().removeFromEntityGrid(entity, entity.x, entity.y);

    self.region.remove(entity);
  }

  cleanCombat(entity) {
    const self = this;

    _.each(this.entities, oEntity => {
      if (oEntity instanceof Character && oEntity.combat.hasAttacker(entity)) {
        oEntity.combat.removeAttacker(entity);
      }
    });
  }

  removeItem(item) {
    const self = this;

    self.removeEntity(item);
    self.push(Packets.PushOpcode.Broadcast, {
      message: new Messages.Despawn(item.instance)
    });

    if (item.static) {
      item.respawn();
    }
  }

  removePlayer(player) {
    const self = this;

    self.push(Packets.PushOpcode.Regions, {
      regionId: player.region,
      message: new Messages.Despawn(player.instance)
    });

    if (player.ready) {
      player.save();
    }

    if (self.populationCallback) {
      self.populationCallback();
    }

    self.removeEntity(player);

    self.cleanCombat(player);

    if (player.isGuest) {
      self.database.delete(player);
    }

    delete self.players[player.instance];
    delete self.network.packets[player.instance];

    player.destroy();
    player = null;
  }

  removeProjectile(projectile) {
    const self = this;

    self.removeEntity(projectile);

    delete self.projectiles[projectile.instance];
  }

  removeChest(chest) {
    const self = this;

    self.removeEntity(chest);
    self.push(Packets.PushOpcode.Broadcast, {
      message: new Messages.Despawn(chest.instance)
    });

    if (chest.static) {
      chest.respawn();
    } else {
      delete self.chests[chest.instance];
    }
  }

  globalMessage(source, message, colour, isGlobal, withBubble) {
    const self = this;

    self.push(Packets.PushOpcode.Broadcast, {
      message: new Messages.Chat({
        name: source,
        text: message,
        colour: colour,
        isGlobal: isGlobal,
        withBubble: withBubble
      })
    });
  }

  isOnline(username) {
    const self = this;

    for (const id in self.players) {
      if (self.players.hasOwnProperty(id)) {
        if (
          self.players[id].username.toLowerCase() === username.toLowerCase()
        ) {
          return true;
        }
      }
    }

    return false;
  }

  getPlayerByName(name) {
    const self = this;

    for (const id in self.players) {
      if (self.players.hasOwnProperty(id)) {
        if (self.players[id].username.toLowerCase() === name.toLowerCase()) {
          return self.players[id];
        }
      }
    }

    return null;
  }

  isFull() {
    return this.getPopulation() >= this.maxPlayers;
  }

  getPlayerByInstance(instance) {
    const self = this;

    if (instance in self.players) {
      return self.players[instance];
    }

    return null;
  }

  forEachPlayer(callback) {
    _.each(this.players, player => {
      callback(player);
    });
  }

  getPVPAreas() {
    return this.map.areas.PVP.pvpAreas;
  }

  getMusicAreas() {
    return this.map.areas.Music.musicAreas;
  }

  getChestAreas() {
    return this.map.areas.Chests.chestAreas;
  }

  getOverlayAreas() {
    return this.map.areas.Overlays.overlayAreas;
  }

  getCameraAreas() {
    return this.map.areas.Cameras.cameraAreas;
  }

  getGrids() {
    return this.map.grids;
  }

  getPopulation() {
    return _.size(this.players);
  }

  onPlayerConnection(callback) {
    this.playerConnectCallback = callback;
  }

  onPopulationChange(callback) {
    this.populationCallback = callback;
  }
}

module.exports = World;
