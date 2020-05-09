const _ = require("underscore");

/**
 * Global Values
 */

const collisions = {};
const entities = {};
let mobsFirstGid = -1;
let map;
let mode;

module.exports = function parse(json, options) {
  this.json = json;
  this.options = options;

  mode = this.options.mode;

  map = {
    width: 0,
    height: 0,
    collisions: [],
    version: new Date().getTime()
  };

  switch (mode) {
    case "info":
      map.lights = [];
      map.high = [];
      map.animated = {};
      map.tilesets = [];
      map.animations = {};

      break;

    case "client":
      map.lights = [];
      map.data = [];
      map.high = [];

      map.animated = {};
      map.depth = 1;

      break;

    case "server":
      map.objects = [];
      map.cursors = {};
      map.trees = {};
      map.treeIndexes = [];

      map.tilesets = [];
      map.pvpAreas = [];
      map.gameAreas = [];
      map.doors = {};
      map.musicAreas = [];

      map.staticEntities = {};
      map.chestAreas = [];
      map.chests = [];

      map.overlayAreas = [];
      map.cameraAreas = [];

      map.lights = [];
      map.plateau = {};

      break;
  }

  map.width = this.json.width;
  map.height = this.json.height;

  map.tilesize = this.json.tilewidth;

  const handleProperty = function(property, value, id) {
    if (property === "c" || property === "o") collisions[id] = true;

    if (mode === "client" || mode === "info") {
      if (property === "v") map.high.push(id);

      if (property === "l") map.lights.push(id);

      if (property === "length") {
        if (!map.animated[id]) map.animated[id] = {};

        map.animated[id].l = value;
      }

      if (property === "delay") {
        if (!map.animated[id]) map.animated[id] = {};

        map.animated[id].d = value;
      }
    }

    if (mode === "server" && property === "o") map.objects.push(id);

    if (mode === "server" && property === "cursor") map.cursors[id] = value;

    if (mode === "server" && property === "tree") map.trees[id] = value;
  };

  const handleAnimation = function(id, firstGID, tile) {
    const animationData = [];

    _.each(tile.animation, function(animation) {
      animationData.push({
        duration: animation.duration,
        tileid: parseInt(firstGID) + parseInt(animation.tileid) - 1
      });
    });

    map.animations[id - 1] = animationData;
  };

  if (this.json.tilesets instanceof Array) {
    _.each(this.json.tilesets, function(tileset) {
      const name = tileset.name.toLowerCase();

      if (mode === "info" || mode === "server") {
        if (tileset.name !== "Mobs") {
          map.tilesets.push({
            name: tileset.name,
            firstGID: tileset.firstgid,
            lastGID: tileset.firstgid + tileset.tilecount - 1,
            imageName: tileset.image.includes("/")
              ? tileset.image.split("/")[2]
              : tileset.image,
            scale: tileset.name === "tilesheet" ? 2 : 1
          });
        }
      }

      if (name === "mobs" && mode === "server") {
        mobsFirstGid = tileset.firstgid;

        _.each(tileset.tiles, function(tile) {
          entities[parseInt(tile.id) + 1] = {};

          _.each(tile.properties, function(property) {
            entities[parseInt(tile.id) + 1][property.name] = property.value;
          });
        });
      }

      _.each(tileset.tiles, function(tile, index) {
        const id = parseInt(tileset.firstgid) + parseInt(tile.id);

        if (tile.animation && mode === "info") {
          handleAnimation(id, tileset.firstgid, tile);
        } else {
          _.each(tile.properties, function(data) {
            handleProperty(
              data.name,
              isValid(parseInt(data.value, 10))
                ? parseInt(data.value, 10)
                : data.value,
              id
            );
          });
        }
      });
    });
  }

  _.each(this.json.layers, function(layer) {
    const name = layer.name.toLowerCase();

    if (mode === "server") {
      switch (name) {
        case "doors":
          const doors = layer.objects;

          _.each(doors, function(door) {
            if (door.properties.length > 2) {
              map.doors[door.id] = {
                o: door.properties[0].value,
                tx: parseInt(door.properties[1].value),
                ty: parseInt(door.properties[2].value),
                x: door.x / 16,
                y: door.y / 16
              };
            }
          });

          break;

        case "chestareas":
          const cAreas = layer.objects;

          _.each(cAreas, function(area) {
            const chestArea = {
              x: area.x / map.tilesize,
              y: area.y / map.tilesize,
              width: area.width / map.tilesize,
              height: area.height / map.tilesize
            };

            _.each(area.properties, function(property) {
              chestArea["t" + property.name] = property.value;
            });

            map.chestAreas.push(chestArea);
          });

          break;

        case "chests":
          const chests = layer.objects;

          _.each(chests, function(chest) {
            const oChest = {
              x: chest.x / map.tilesize,
              y: chest.y / map.tilesize
            };

            oChest.i = _.map(chest.properties[0].value.split(","), function(
              name
            ) {
              return name;
            });

            map.chests.push(oChest);
          });

          break;

        case "lights":
          const lights = layer.objects;

          _.each(lights, function(lightObject) {
            const light = {
              x: lightObject.x / 16 + 0.5,
              y: lightObject.y / 16 + 0.5
            };

            _.each(lightObject.properties, function(property) {
              light[property.name] = property.value;
            });

            map.lights.push(light);
          });

          break;

        case "music":
          const mAreas = layer.objects;

          _.each(mAreas, function(area) {
            const musicArea = {
              x: area.x / map.tilesize,
              y: area.y / map.tilesize,
              width: area.width / map.tilesize,
              height: area.height / map.tilesize
            };

            _.each(area.properties, function(property) {
              musicArea[property.name] = property.value;
            });

            map.musicAreas.push(musicArea);
          });

          break;

        case "pvp":
          const pAreas = layer.objects;

          _.each(pAreas, function(area) {
            const pvpArea = {
              x: area.x / map.tilesize,
              y: area.y / map.tilesize,
              width: area.width / map.tilesize,
              height: area.height / map.tilesize
            };

            map.pvpAreas.push(pvpArea);
          });

          break;

        case "overlays":
          const overlayAreas = layer.objects;

          _.each(overlayAreas, function(area) {
            const oArea = {
              id: area.id,
              x: area.x / map.tilesize,
              y: area.y / map.tilesize,
              width: area.width / map.tilesize,
              height: area.height / map.tilesize
            };

            _.each(area.properties, function(property) {
              oArea[property.name] = isNaN(property.value)
                ? property.value
                : parseFloat(property.value);
            });

            map.overlayAreas.push(oArea);
          });

          break;

        case "camera":
          const cameraAreas = layer.objects;

          _.each(cameraAreas, function(area) {
            const cArea = {
              id: area.id,
              x: area.x / map.tilesize,
              y: area.y / map.tilesize,
              width: area.width / map.tilesize,
              height: area.height / map.tilesize,
              type: area.properties[0].value
            };

            map.cameraAreas.push(cArea);
          });

          break;

        case "games":
          const gAreas = layer.objects;

          _.each(gAreas, function(area) {
            const gameArea = {
              x: area.x / map.tilesize,
              y: area.y / map.tilesize,
              width: area.width / map.tilesize,
              height: area.height / map.tilesize
            };

            map.gameAreas.push(gameArea);
          });

          break;
      }
    }
  });

  for (let i = this.json.layers.length; i > 0; i--) {
    parseLayer(this.json.layers[i - 1]);
  }

  if (mode === "client") {
    for (let i = 0, max = map.data.length; i < max; i++) {
      if (!map.data[i]) map.data[i] = 0;
    }

    map.depth = calculateDepth(map);
  }

  if (mode === "info") map.collisions = [];

  return map;
};

const calculateDepth = function(map) {
  let depth = 1;

  _.each(map.data, info => {
    if (!_.isArray(info)) return;

    if (info.length > depth) depth = info.length;
  });

  return depth;
};

const isValid = function(number) {
  return (
    number &&
    !isNaN(number - 0) &&
    number !== null &&
    number !== "" &&
    number !== false
  );
};

const parseLayer = function(layer) {
  const name = layer.name.toLowerCase();
  const type = layer.type;

  if (name === "entities" && mode === "server") {
    const tiles = layer.data;

    for (let i = 0; i < tiles.length; i++) {
      const gid = tiles[i] - mobsFirstGid + 1;

      if (gid && gid > 0) map.staticEntities[i] = entities[gid];
    }
  }

  const tiles = layer.data;

  if (name === "blocking" && mode === "client") {
    for (let j = 0; j < tiles.length; j++) {
      const bGid = tiles[j];

      if (bGid && bGid > 0) map.collisions.push(j);
    }
  } else if (name.startsWith("plateau") && mode === "server") {
    for (let j = 0; j < tiles.length; j++) {
      const pGid = tiles[j];
      const level = parseInt(name.split("plateau")[1]);

      if (map.collisions.indexOf(j) > -1) {
        // Skip collision indexes.
        continue;
      }

      if (pGid && pGid > 0) map.plateau[j] = level;
    }
  } else if (
    type === "tilelayer" &&
    layer.visible !== 0 &&
    name !== "entities" &&
    !name.startsWith("plateau")
  ) {
    for (let k = 0; k < tiles.length; k++) {
      const tGid = tiles[k];

      if (mode === "client") {
        if (tGid > 0) {
          if (map.data[k] === undefined) map.data[k] = tGid;
          else if (map.data[k] instanceof Array) map.data[k].unshift(tGid);
          else map.data[k] = [tGid, map.data[k]];
        }
      }

      if (tGid in collisions) map.collisions.push(k);

      if (mode === "server" && tGid in map.trees) map.treeIndexes.push(k);
    }
  }
};

if (typeof String.prototype.startsWith !== "function") {
  String.prototype.startsWith = function(str) {
    return str.length > 0 && this.substring(0, str.length) === str;
  };
}

if (typeof String.prototype.endsWith !== "function") {
  String.prototype.endsWith = function(str) {
    return (
      str.length > 0 &&
      this.substring(this.length - str.length, this.length) === str
    );
  };
}
