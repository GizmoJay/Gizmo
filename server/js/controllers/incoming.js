/* global module */

const Packets = require("../network/packets");
    const Request = require("request");
    const _ = require("underscore");
    const Messages = require("../network/messages");
    const sanitizer = require("sanitizer");
    const Commands = require("./commands");
    const Items = require("../util/items");
    const Creator = require("../database/mongodb/creator");
    const Utils = require("../util/utils");

class Incoming {
    constructor (player) {
        const self = this;

        self.player = player;
        self.connection = self.player.connection;
        self.world = self.player.world;
        self.globalObjects = self.world.globalObjects;
        self.database = self.player.database;
        self.commands = new Commands(self.player);

        self.connection.listen((data) => {
            const packet = data.shift();
                const message = data[0];

            if (!Utils.validPacket(packet)) {
                log.error("Non-existent packet received: " + packet + " data: ");
                log.error(message);

                return;
            }

            self.player.refreshTimeout();

            switch (packet) {
                case Packets.Intro:
                    self.handleIntro(message);
                    break;

                case Packets.Ready:
                    self.handleReady(message);
                    break;

                case Packets.Who:
                    self.handleWho(message);
                    break;

                case Packets.Equipment:
                    self.handleEquipment(message);
                    break;

                case Packets.Movement:
                    self.handleMovement(message);
                    break;

                case Packets.Request:
                    self.handleRequest(message);
                    break;

                case Packets.Target:
                    self.handleTarget(message);
                    break;

                case Packets.Combat:
                    self.handleCombat(message);
                    break;

                case Packets.Projectile:
                    self.handleProjectile(message);
                    break;

                case Packets.Network:
                    self.handleNetwork(message);
                    break;

                case Packets.Chat:
                    self.handleChat(message);
                    break;

                case Packets.Command:
                    self.handleCommand(message);
                    break;

                case Packets.Inventory:
                    self.handleInventory(message);
                    break;

                case Packets.Bank:
                    self.handleBank(message);
                    break;

                case Packets.Respawn:
                    self.handleRespawn(message);
                    break;

                case Packets.Trade:
                    self.handleTrade(message);
                    break;

                case Packets.Enchant:
                    self.handleEnchant(message);
                    break;

                case Packets.Click:
                    self.handleClick(message);
                    break;

                case Packets.Warp:
                    self.handleWarp(message);
                    break;

                case Packets.Shop:
                    self.handleShop(message);
                    break;

                case Packets.Region:
                    self.handleRegion(message);
                    break;

                case Packets.Camera:
                    self.handleCamera(message);
                    break;

                case Packets.Client:
                    self.handleClient(message);
                    break;
            }
        });
    }

    handleIntro (message) {
        const self = this;
            const loginType = message.shift();
            const username = message.shift().toLowerCase();
            const password = message.shift();
            const isRegistering = loginType === Packets.IntroOpcode.Register;
            const isGuest = loginType === Packets.IntroOpcode.Guest;
            const email = isRegistering ? message.shift() : "";
            const formattedUsername = username ? username.charAt(0).toUpperCase() + username.slice(1) : "";

        self.player.username = formattedUsername.substr(0, 32).trim().toLowerCase();
        self.player.password = password.substr(0, 32);
        self.player.email = email.substr(0, 128).toLowerCase();

        if (self.introduced) { return; }

        if (self.world.isOnline(self.player.username)) {
            self.connection.sendUTF8("loggedin");
            self.connection.close("Player already logged in..");
            return;
        }

        if (config.overrideAuth) {
            self.database.login(self.player);
            return;
        }

        if (config.offlineMode) {
            const creator = new Creator(null);

            self.player.load(Creator.getFullData(self.player));
            self.player.intro();

            return;
        }

        self.introduced = true;

        if (isRegistering) {
            self.database.exists(self.player, (result) => {
                if (result.exists) {
                    self.connection.sendUTF8(result.type + "exists");
                    self.connection.close(result.type + " is not available.");
                } else { self.database.register(self.player); }
            });
        } else if (isGuest) {
            self.player.username = "Guest" + Utils.randomInt(0, 2000000);
            self.player.password = null;
            self.player.email = null;
            self.player.isGuest = true;

            self.database.login(self.player);
        } else {
 self.database.verify(self.player, (result) => {
                if (result.status === "success") { self.database.login(self.player); } else {
                    self.connection.sendUTF8("invalidlogin");
                    self.connection.close("Wrong password entered for: " + self.player.username);
                }
            });
}
    }

    handleReady (message) {
        const self = this;
            const isReady = message.shift();
            const preloadedData = message.shift();
            const userAgent = message.shift();

        if (!isReady) { return; }

        if (self.player.regionsLoaded.length > 0 && !preloadedData) { self.player.regionsLoaded = []; }

        self.player.ready = true;

        self.world.region.handle(self.player);
        self.world.region.push(self.player);

        self.player.sendEquipment();
        self.player.loadInventory();
        self.player.loadQuests();

        if (self.world.map.isOutOfBounds(self.player.x, self.player.y)) { self.player.setPosition(50, 89); }

        if (self.player.userAgent !== userAgent) {
            self.player.userAgent = userAgent;

            self.player.regionsLoaded = [];
            self.player.updateRegion(true);
        }

        if (self.player.new || config.offlineMode) {
            self.player.questsLoaded = true;
            self.player.achievementsLoaded = true;
        }

        self.player.save();

        if (config.hubEnabled) { self.world.api.sendChat(Utils.formatUsername(self.player.username), "has logged in!"); }

        if (self.player.readyCallback) { self.player.readyCallback(); }

        self.player.sync();
    }

    handleWho (message) {
        const self = this;

        _.each(message.shift(), (id) => {
            const entity = self.world.getEntityByInstance(id);

            if (!entity || entity.dead) { return; }

            /* We handle player-specific entity statuses here. */

            // Entity is an area-based mob
            if (entity.area) { entity.specialState = "area"; }

            if (self.player.quests.isQuestNPC(entity)) { entity.specialState = "questNpc"; }

            if (self.player.quests.isQuestMob(entity)) { entity.specialState = "questMob"; }

            if (entity.miniboss) {
                entity.specialState = "miniboss";
                entity.customScale = 1.25;
            }

            if (entity.boss) { entity.specialState = "boss"; }

            // if (self.player.quests.isAchievementNPC(entity))
            //    entity.specialState = 'achievementNpc';

            self.player.send(new Messages.Spawn(entity));
        });
    }

    handleEquipment (message) {
        const self = this;
            const opcode = message.shift();

        switch (opcode) {
            case Packets.EquipmentOpcode.Unequip:
                const type = message.shift();

                if (!self.player.inventory.hasSpace()) {
                    self.player.send(new Messages.Notification(Packets.NotificationOpcode.Text, "You do not have enough space in your inventory."));
                    return;
                }

                switch (type) {
                    case "weapon":

                        if (!self.player.hasWeapon()) { return; }

                        self.player.inventory.add(self.player.weapon.getItem());
                        self.player.setWeapon(-1, -1, -1, -1);

                        break;

                    case "armour":
                        if (self.player.hasArmour() && self.player.armour.id === 114) { return; }

                        self.player.inventory.add(self.player.armour.getItem());
                        self.player.setArmour(114, 1, -1, -1);

                        break;

                    case "pendant":

                        if (!self.player.hasPendant()) { return; }

                        self.player.inventory.add(self.player.pendant.getItem());
                        self.player.setPendant(-1, -1, -1, -1);

                        break;

                    case "ring":

                        if (!self.player.hasRing()) { return; }

                        self.player.inventory.add(self.player.ring.getItem());
                        self.player.setRing(-1, -1, -1, -1);

                        break;

                    case "boots":

                        if (!self.player.hasBoots()) { return; }

                        self.player.inventory.add(self.player.boots.getItem());
                        self.player.setBoots(-1, -1, -1, -1);

                        break;
                }

                self.player.send(new Messages.Equipment(Packets.EquipmentOpcode.Unequip, [type]));

                break;
        }
    }

    handleMovement (message) {
        const self = this;
            const opcode = message.shift();
            let orientation;

        if (!self.player || self.player.dead) { return; }

        switch (opcode) {
            case Packets.MovementOpcode.Request:
                const requestX = message.shift();
                    const requestY = message.shift();
                    const playerX = message.shift();
                    const playerY = message.shift();

                if (self.preventNoClip(requestX, requestY)) { self.player.guessPosition(requestX, requestY); }

                self.player.movementStart = new Date().getTime();

                break;

            case Packets.MovementOpcode.Started:
                const selectedX = message.shift();
                    const selectedY = message.shift();
                    const pX = message.shift();
                    const pY = message.shift();
                    const movementSpeed = message.shift();
                    const targetId = message.shift();

                if (!movementSpeed || movementSpeed != self.player.movementSpeed) { self.player.incrementCheatScore(1); }

                if (pX !== self.player.x || pY !== self.player.y || self.player.stunned || !self.preventNoClip(selectedX, selectedY)) { return; }

                if (!targetId) {
                    self.player.removeTarget();
                    self.player.combat.stop();
                }

                self.player.moving = true;

                break;

            case Packets.MovementOpcode.Step:
                const x = message.shift();
                    const y = message.shift();

                if (self.player.stunned || !self.preventNoClip(x, y)) { return; }

                self.player.setPosition(x, y);

                break;

            case Packets.MovementOpcode.Stop:
                const posX = message.shift();
                    const posY = message.shift();
                    const id = message.shift();
                    const hasTarget = message.shift();
                    const entity = self.world.getEntityByInstance(id);

                if (!self.player.moving) {
                    log.debug(`Did not receive movement start packet for ${self.player.username}.`);

                    self.player.incrementCheatScore(1);
                }

                orientation = message.shift();

                if (entity && entity.type === "item") { self.player.inventory.add(entity); }

                if (self.world.map.isDoor(posX, posY) && !hasTarget) {
                    const door = self.player.doors.getDoor(posX, posY);

                    if (door && self.player.doors.getStatus(door) === "closed") { return; }

                    const destination = self.world.map.getDoorDestination(posX, posY);

                    self.player.teleport(destination.x, destination.y, true);
                } else {
                    self.player.setPosition(posX, posY);
                    self.player.setOrientation(orientation);
                }

                self.player.moving = false;
                self.player.lastMovement = new Date().getTime();

                const diff = self.player.lastMovement - self.player.movementStart;

                if (diff < self.player.movementSpeed) { self.player.incrementCheatScore(1); }

                break;

            case Packets.MovementOpcode.Entity:

                const instance = message.shift();
                    const entityX = message.shift();
                    const entityY = message.shift();
                    const oEntity = self.world.getEntityByInstance(instance);

                if (!oEntity || (oEntity.x === entityX && oEntity.y === entityY)) { return; }

                oEntity.setPosition(entityX, entityY);

                if (oEntity.hasTarget()) { oEntity.combat.forceAttack(); }

                break;

            case Packets.MovementOpcode.Orientate:
                orientation = message.shift();

                self.world.push(Packets.PushOpcode.Regions, {
                    regionId: self.player.region,
                    message: new Messages.Movement(Packets.MovementOpcode.Orientate, [self.player.instance, orientation])
                });

                break;

            case Packets.MovementOpcode.Freeze:
                /**
                 * Just used to prevent player from following entities in combat.
                 * This is primarily for the 'hold-position' functionality.
                 */

                self.player.frozen = message.shift();

                break;

            case Packets.MovementOpcode.Zone:
                const direction = message.shift();

                log.debug(`Zoning detected, direction: ${direction}.`);

                break;
        }
    }

    handleRequest (message) {
        const self = this;
            const id = message.shift();

        if (id !== self.player.instance) { return; }

        self.world.region.push(self.player);
    }

    handleTarget (message) {
        const self = this;
            const opcode = message.shift();
            const instance = message.shift();

		log.debug(`Target [opcode]: ${instance} [${opcode}]`);

        switch (opcode) {
            case Packets.TargetOpcode.Talk:
                const entity = self.world.getEntityByInstance(instance);

                if (!entity || !self.player.isAdjacent(entity)) { return; }

                self.player.cheatScore = 0;

                if (entity.type === "chest") {
                    entity.openChest();
                    return;
                }

                if (entity.dead) { return; }

                if (self.player.npcTalkCallback) { self.player.npcTalkCallback(entity); }

                break;

            case Packets.TargetOpcode.Attack:

                const target = self.world.getEntityByInstance(instance);

                if (!target || target.dead || !self.canAttack(self.player, target)) { return; }

                self.player.cheatScore = 0;

                self.world.push(Packets.PushOpcode.Regions, {
                    regionId: target.region,
                    message: new Messages.Combat(Packets.CombatOpcode.Initiate, {
                        attackerId: self.player.instance,
                        targetId: target.instance
                    })
                });

                break;

            case Packets.TargetOpcode.None:

                // Nothing do to here.

                break;

            case Packets.TargetOpcode.Object:

                const data = self.globalObjects.getData(instance);

                if (!data) { return; }

                const message = self.globalObjects.talk(data.object, self.player);

                self.world.push(Packets.PushOpcode.Player, {
                    player: self.player,
                    message: new Messages.Bubble({
                        id: instance,
                        text: message,
                        duration: 5000,
                        isObject: true,
                        info: data.info
                    })
                });

                break;
        }
    }

    handleCombat (message) {
        const self = this;
            const opcode = message.shift();

        switch (opcode) {
            case Packets.CombatOpcode.Initiate:
                const attacker = self.world.getEntityByInstance(message.shift());
                    const target = self.world.getEntityByInstance(message.shift());

                if (!target || target.dead || !attacker || attacker.dead || !self.canAttack(attacker, target)) { return; }

                attacker.setTarget(target);

                if (!attacker.combat.started) { attacker.combat.forceAttack(); } else {
                    attacker.combat.start();

                    attacker.combat.attack(target);
                }

                if (target.combat) { target.combat.addAttacker(attacker); }

                break;
        }
    }

    handleProjectile (message) {
        const self = this;
            const type = message.shift();

        switch (type) {
            case Packets.ProjectileOpcode.Impact:
                const projectile = self.world.getEntityByInstance(message.shift());
                    const target = self.world.getEntityByInstance(message.shift());

                if (!target || target.dead || !projectile) { return; }

                self.world.handleDamage(projectile.owner, target, projectile.damage);
                self.world.removeProjectile(projectile);

                if (target.combat.started || target.dead || target.type !== "mob") { return; }

                target.begin(projectile.owner);

                break;
        }
    }

    handleNetwork (message) {
        const self = this;
            const opcode = message.shift();

        switch (opcode) {
            case Packets.NetworkOpcode.Pong:
                const time = new Date().getTime();

                self.player.notify(`Latency of ${time - self.player.pingTime}ms`, "red");
                break;
        }
    }

    handleChat (message) {
        const self = this;
            const text = sanitizer.escape(sanitizer.sanitize(message.shift()));

        if (!text || text.length < 1 || !(/\S/.test(text))) { return; }

        if (text.charAt(0) === "/" || text.charAt(0) === ";") { self.commands.parse(text); } else {
            if (self.player.isMuted()) {
                self.player.send(new Messages.Notification(Packets.NotificationOpcode.Text, "You are currently muted."));
                return;
            }

            if (!self.player.canTalk) {
                self.player.send(new Messages.Notification(Packets.NotificationOpcode.Text, "You are not allowed to talk for the duration of this event."));
                return;
            }

            log.debug(`${self.player.username} - ${text}`);

            if (config.hubEnabled) { self.world.api.sendChat(Utils.formatUsername(self.player.username), text, true); }

            self.world.push(Packets.PushOpcode.Regions, {
                regionId: self.player.region,
                message: new Messages.Chat({
                    id: self.player.instance,
                    name: self.player.username,
                    withBubble: true,
                    text: text,
                    duration: 7000
                })
            });
        }
    }

    handleCommand (message) {
        const self = this;
            const opcode = message.shift();

        if (self.player.rights < 2) { return; }

        switch (opcode) {
            case Packets.CommandOpcode.CtrlClick:
                const position = message.shift();

                self.player.teleport(position.x, position.y, false, true);

                break;
        }
    }

    handleInventory (message) {
        const self = this;
            const opcode = message.shift();
            let id; let ability; let abilityLevel;

        switch (opcode) {
            case Packets.InventoryOpcode.Remove:
                const item = message.shift();
                    let count;

                if (!item) { return; }

                if (item.count > 1) { count = message.shift(); }

                id = Items.stringToId(item.string);

                const iSlot = self.player.inventory.slots[item.index];

                if (iSlot.id < 1) { return; }

                if (count > iSlot.count) { count = iSlot.count; }

                ability = iSlot.ability, abilityLevel = iSlot.abilityLevel;

                if (self.player.inventory.remove(id, count || item.count, item.index)) { self.world.dropItem(id, count || 1, self.player.x, self.player.y, ability, abilityLevel); }

                break;

            case Packets.InventoryOpcode.Select:
                const index = message.shift();
                    const slot = self.player.inventory.slots[index];
                    const string = slot.string;
                    const sCount = slot.count;

                ability = slot.ability,
                abilityLevel = slot.abilityLevel;

                if (!slot || slot.id < 1) { return; }

                id = Items.stringToId(slot.string);

                if (slot.equippable) {
                    if (!self.player.canEquip(string)) { return; }

                    self.player.inventory.remove(id, slot.count, slot.index);

                    self.player.equip(string, sCount, ability, abilityLevel);
                } else if (slot.edible) {
                    self.player.inventory.remove(id, 1, slot.index);

                    self.player.eat(id);
                }

                break;
        }
    }

    handleBank (message) {
        const self = this;
            const opcode = message.shift();

        switch (opcode) {
            case Packets.BankOpcode.Select:
                const type = message.shift();
                    const index = message.shift();
                    const isBank = type === "bank";

                if (isBank) {
                    const bankSlot = self.player.bank.getInfo(index);

                    if (bankSlot.id < 1) { return; }

                    // Infinite stacks move all at once, otherwise move one by one.
                    const moveAmount = Items.maxStackSize(bankSlot.id) === -1 ? bankSlot.count : 1;

                    bankSlot.count = moveAmount;

                    if (self.player.inventory.add(bankSlot)) { self.player.bank.remove(bankSlot.id, moveAmount, index); }
                } else {
                    const inventorySlot = self.player.inventory.slots[index];

                    if (inventorySlot.id < 1) { return; }

                    if (self.player.bank.add(inventorySlot.id, inventorySlot.count, inventorySlot.ability, inventorySlot.abilityLevel)) { self.player.inventory.remove(inventorySlot.id, inventorySlot.count, index); }
                }

                break;
        }
    }

    handleRespawn (message) {
        const self = this;
            const instance = message.shift();

        if (self.player.instance !== instance) { return; }

        const spawn = self.player.getSpawn();

        self.player.dead = false;
        self.player.setPosition(spawn.x, spawn.y);

        self.world.push(Packets.PushOpcode.Regions, {
            regionId: self.player.region,
            message: new Messages.Spawn(self.player),
            ignoreId: self.player.instance
        });

        self.player.send(new Messages.Respawn(self.player.instance, self.player.x, self.player.y));

        self.player.revertPoints();
    }

    handleTrade (message) {
        const self = this;
            const opcode = message.shift();
            const oPlayer = self.world.getEntityByInstance(message.shift());

        if (!oPlayer || !opcode) { return; }

        switch (opcode) {
            case Packets.TradeOpcode.Request:

                break;

            case Packets.TradeOpcode.Accept:

                break;

            case Packets.TradeOpcode.Decline:

                break;
        }
    }

    handleEnchant (message) {
        const self = this;
            const opcode = message.shift();

        switch (opcode) {
            case Packets.EnchantOpcode.Select:
                const index = message.shift();
                    const item = self.player.inventory.slots[index];
                    let type = "item";

                if (item.id < 1) { return; }

                if (Items.isShard(item.id)) { type = "shards"; }

                self.player.enchant.add(type, item);

                break;

            case Packets.EnchantOpcode.Remove:

                self.player.enchant.remove(message.shift());

                break;

            case Packets.EnchantOpcode.Enchant:

                self.player.enchant.enchant();

                break;
        }
    }

    handleClick (message) {
        const self = this;
            const type = message.shift();
            const state = message.shift();

        switch (type) {
            case "profile":

                self.player.toggleProfile(state);

                break;

            case "inventory":

                self.player.toggleInventory(state);

                break;

            case "warp":

                self.player.toggleWarp(state);

                break;
        }
    }

    handleWarp (message) {
        const self = this;
            const id = parseInt(message.shift()) - 1;

        if (self.player.warp) { self.player.warp.warp(id); }
    }

    handleShop (message) {
        const self = this;
            const opcode = message.shift();
            const npcId = message.shift();

        switch (opcode) {
            case Packets.ShopOpcode.Buy:
                const buyId = message.shift();
                    const amount = message.shift();

                if (!buyId || !amount) {
                    self.player.notify("Incorrect purchase packets.");
                    return;
                }

                log.debug("Received Buy: " + npcId + " " + buyId + " " + amount);

                self.world.shops.buy(self.player, npcId, buyId, amount);

                break;

            case Packets.ShopOpcode.Sell:

                if (!self.player.selectedShopItem) {
                    self.player.notify("No item has been selected.");
                    return;
                }

                self.world.shops.sell(self.player, npcId, self.player.selectedShopItem.index);

                break;

            case Packets.ShopOpcode.Select:
                let slotId = message.shift();

                if (!slotId) {
                    self.player.notify("Incorrect purchase packets.");
                    return;
                }

                slotId = parseInt(slotId);

                /**
                 * Though all this could be done client-sided
                 * it's just safer to send it to the server to sanitize data.
                 * It also allows us to add cheat checks in the future
                 * or do some fancier stuff.
                 */

                const item = self.player.inventory.slots[slotId];

                if (!item || item.id < 1) { return; }

                if (self.player.selectedShopItem) { self.world.shops.remove(self.player); }

                const currency = self.world.shops.getCurrency(npcId);

                if (!currency) { return; }

                self.player.send(new Messages.Shop(Packets.ShopOpcode.Select, {
                    id: npcId,
                    slotId: slotId,
                    currency: Items.idToString(currency),
                    price: self.world.shops.getSellPrice(npcId, item.id)
                }));

                self.player.selectedShopItem = {
                    id: npcId,
                    index: item.index
                };

                log.debug("Received Select: " + npcId + " " + slotId);

                break;

            case Packets.ShopOpcode.Remove:

                self.world.shops.remove(self.player);

                break;
        }
    }

    handleCamera (message) {
        const self = this;

        log.info(self.player.x + " " + self.player.y);

        self.player.cameraArea = null;
        self.player.handler.detectCamera(self.player.x, self.player.y);
    }

    /**
     * Receive client information such as screen size, will be expanded
     * for more functionality when needed.
     */

    handleClient (message) {
        const self = this;
            const canvasWidth = message.shift();
            const canvasHeight = message.shift();

        if (!canvasWidth || !canvasHeight) { return; }

        /**
         * The client is by default scaled to 3x the normal
         * tileSize of 16x16. So we are using 48x48 to find
         * a desireable region size.
         */

        self.player.regionWidth = Math.ceil(canvasWidth / 48);
        self.player.regionHeight = Math.ceil(canvasHeight / 48);
    }

    canAttack (attacker, target) {
        /**
         * Used to prevent client-sided manipulation. The client will send the packet to start combat
         * but if it was modified by a presumed hacker, it will simply cease when it arrives to this condition.
         */

        if (attacker.type === "mob" || target.type === "mob") { return true; }

        return attacker.type === "player" && target.type === "player" && attacker.pvp && target.pvp;
    }

    preventNoClip (x, y) {
        const self = this;
            const isMapColliding = self.world.map.isColliding(x, y);
            const isInstanceColliding = self.player.doors.hasCollision(x, y);
            const isObject = self.world.map.isPositionObject(x, y);

        if (isObject) { return true; }

        if (isMapColliding || isInstanceColliding) {
            self.handleNoClip(x, y);
            return false;
        }

        return true;
    }

    handleNoClip (x, y) {
        const self = this;

        self.player.stopMovement(true);
        self.player.notify("We have detected no-clipping in your client. Please submit a bug report.");

        x = self.player.previousX < 0 ? self.player.x : self.player.previousX;
        y = self.player.previousY < 0 ? self.player.y : self.player.previousY;

        if (self.world.map.isColliding(x, y)) {
            const spawn = self.player.getSpawn();

            x = spawn.x, y = spawn.y;
        }

        self.player.teleport(x, y, false, true);
    }
}

module.exports = Incoming;
