#!/usr/bin/env node

const Log = require("../../server/js/util/log");
const worldClient = require("../../server/data/map/world_client");
const worldServer = require("../../server/data/map/world_server");

config = {
  debug: true,
  debugLevel: "all"
};

class Helper {
  constructor() {
    const This = this;

    This.width = worldServer.width;
    This.height = worldServer.height;

    // Palm Tree Stump
    This.getTileData(45, 132);
    This.getTileData(46, 132);
    This.getTileData(45, 133);
    This.getTileData(46, 133);

    log.debug("-----------");

    // Cut Palm Stump
    This.getTileData(49, 136);
    This.getTileData(50, 136);
    This.getTileData(49, 137);
    This.getTileData(50, 137);

    // for (let i = 1; i < 5; i++)
    //    for (let j = 1; j < 5; j++)
    //        This.getTileData(9 + i, 91 + j);
  }

  getTileData(x, y) {
    const This = this;
    const index = This.gridPositionToIndex(x, y);

    console.log(
      `"${index}": { "data": [${worldClient.data[index]}], "isColliding": ${
        worldClient.collisions.indexOf(index) > -1
      } },`
    );
    // log.info(index + ' -- ' + worldClient.data[index]);
  }

  gridPositionToIndex(x, y) {
    return y * this.width + x;
  }

  indexToGridPosition(tileIndex) {
    const This = this;

    tileIndex -= 1;

    const x = This.getX(tileIndex + 1, This.width);
    const y = Math.floor(tileIndex / This.width);

    return {
      x: x,
      y: y
    };
  }

  getX(index, width) {
    if (index === 0) return 0;

    return index % width === 0 ? width - 1 : (index % width) - 1;
  }
}

module.exports = Helper;

function main() {
  new Helper();
}

main();
