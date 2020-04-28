/* global module */

const _ = require("underscore");
    const Character = require("../character");
    const Mobs = require("../../../../util/mobs");
    const Utils = require("../../../../util/utils");
    const Items = require("../../../../util/items");
    const Constants = require("../../../../util/constants");
    const MobHandler = require("./mobhandler");

class Mob extends Character {
    constructor (id, instance, x, y, world) {
        super(id, "mob", instance, x, y);

        const self = this;

        if (!Mobs.exists(id)) { return; }

        self.world = world;

        self.data = Mobs.Ids[self.id];
        self.hitPoints = self.data.hitPoints;
        self.maxHitPoints = self.data.hitPoints;
        self.drops = self.data.drops;

        self.respawnDelay = self.data.spawnDelay;

        self.level = self.data.level;

        self.armourLevel = self.data.armour;
        self.weaponLevel = self.data.weapon;
        self.attackRange = self.data.attackRange;
        self.aggroRange = self.data.aggroRange;
        self.aggressive = self.data.aggressive;
        self.attackRate = self.data.attackRate;
        self.movementSpeed = self.data.movementSpeed;

        self.spawnLocation = [x, y];

        self.dead = false;
        self.boss = false;
        self.static = false;
        self.hiddenName = false;

        self.roaming = false;
        self.maxRoamingDistance = 3;

        self.projectileName = self.getProjectileName();
    }

    load () {
        const self = this;

        self.handler = new MobHandler(self, self.world);

        if (self.loadCallback) { self.loadCallback(); }
    }

    refresh () {
        const self = this;

        self.hitPoints = self.data.hitPoints;
        self.maxHitPoints = self.data.hitPoints;

        if (self.refreshCallback) { self.refreshCallback(); }
    }

    getDrop () {
        const self = this;

        if (!self.drops) { return null; }

        const random = Utils.randomInt(0, Constants.DROP_PROBABILITY);
            const dropObjects = Object.keys(self.drops);
            const item = dropObjects[Utils.randomInt(0, dropObjects.length - 1)];

        if (random > self.drops[item]) { return null; }

        const count = item === "gold" ? Utils.randomInt(self.level, self.level * 5) : 1;

        return {
            id: Items.stringToId(item),
            count: count
        };
    }

    getProjectileName () {
        return this.data.projectileName ? this.data.projectileName : "projectile-pinearrow";
    }

    canAggro (player) {
        const self = this;

        if (self.hasTarget()) { return false; }

        if (!self.aggressive) { return false; }

        if ((Math.floor(self.level * 1.5) < player.level) && !self.alwaysAggressive) { return false; }

        if (!player.hasAggressionTimer()) { return false; }

        return self.isNear(player, self.aggroRange);
    }

    destroy () {
        const self = this;

        self.dead = true;
        self.clearTarget();
        self.resetPosition();
        self.respawn();

        if (self.area) { self.area.removeEntity(self); }
    }

    return () {
        const self = this;

        self.clearTarget();
        self.resetPosition();
        self.setPosition(self.x, self.y);
    }

    isRanged () {
        return this.attackRange > 1;
    }

    distanceToSpawn () {
        return this.getCoordDistance(this.spawnLocation[0], this.spawnLocation[1]);
    }

    isAtSpawn () {
        return this.x === this.spawnLocation[0] && this.y === this.spawnLocation[1];
    }

    isOutsideSpawn () {
        return this.distanceToSpawn() > this.spawnDistance;
    }

    addToChestArea (chestAreas) {
        const self = this;
            const area = _.find(chestAreas, (area) => { return area.contains(self.x, self.y); });

        if (area) { area.addEntity(self); }
    }

    respawn () {
        const self = this;

        /**
         * Some entities are static (only spawned once during an event)
         * Meanwhile, other entities act as an illusion to another entity,
         * so the resawning script is handled elsewhere.
         */

        if (!self.static || self.respawnDelay === -1) { return; }

        setTimeout(() => {
            if (self.respawnCallback) { self.respawnCallback(); }
        }, self.respawnDelay);
    }

    getState () {
        const self = this;
            const base = super.getState();

        base.hitPoints = self.hitPoints;
        base.maxHitPoints = self.maxHitPoints;
        base.attackRange = self.attackRange;
        base.level = self.level;
        base.hiddenName = self.hiddenName; // TODO - Just don't send name when hiddenName present.

        return base;
    }

    // We take the plateau level of where the entity spawns.
    getPlateauLevel () {
        return this.world.map.getPlateauLevel(this.spawnLocation[0], this.spawnLocation[1]);
    }

    resetPosition () {
        const self = this;

        self.setPosition(self.spawnLocation[0], self.spawnLocation[1]);
    }

    onLoad (callback) {
        this.loadCallback = callback;
    }

    onRespawn (callback) {
        this.respawnCallback = callback;
    }

    onReturn (callback) {
        this.returnCallback = callback;
    }

    onRefresh (callback) {
        this.refreshCallback = callback;
    }

    onDeath (callback) {
        this.deathCallback = callback;
    }
}

module.exports = Mob;
