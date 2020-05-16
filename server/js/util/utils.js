/* global module */

/**
 * This package is used for creating functions used all throughout the
 * game server.
 */

const Utils = {};
const _ = require("underscore");
const Packets = require("../network/packets");

Utils.random = range => {
  return Math.floor(Math.random() * range);
};

Utils.randomRange = (min, max) => {
  return min + Math.random() * (max - min);
};

Utils.randomInt = (min, max) => {
  return min + Math.floor(Math.random() * (max - min + 1));
};

Utils.getDistance = (startX, startY, toX, toY) => {
  const x = Math.abs(startX - toX);
  const y = Math.abs(startY - toY);

  return x > y ? x : y;
};

Utils.getJSLogic = () => {
  return [[][[]] + []][+[]][++[+[]][+[]]];
};

Utils.positionOffset = radius => {
  return {
    x: Utils.randomInt(0, radius),
    y: Utils.randomInt(0, radius)
  };
};

/**
 * We are just using some incremental seeds to prevent ids/instances
 * from ending up with the same numbers/variables.
 */

Utils.idSeed = 0;
Utils.clientSeed = 0;
Utils.instanceSeed = 0;
Utils.socketSeed = 0;

Utils.generateRandomId = () => {
  return ++Utils.idSeed + "" + Utils.randomInt(0, 25000);
};

Utils.generateClientId = () => {
  return ++Utils.clientSeed + "" + Utils.randomInt(0, 25000);
};

Utils.generateInstance = () => {
  return `${++Utils.instanceSeed}${Utils.randomInt(0, 25000)}`;
};

Utils.validPacket = packet => {
  const keys = Object.keys(Packets);
  const filtered = [];

  for (let i = 0; i < keys.length; i++) {
    if (!keys[i].endsWith("Opcode")) filtered.push(keys[i]);
  }

  return packet > -1 && packet < Packets[filtered[filtered.length - 1]] + 1;
};

Utils.getCurrentEpoch = () => {
  return new Date().getTime();
};

Utils.formatUsername = username => {
  return (
    username
      // Decode username characters
      .normalize()
      .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
  );

  // .replace(/\w\S*/g, string => {
  //   return string.charAt(0).toUpperCase() + string.substr(1).toLowerCase();
  // });
};

/**
 * This function is responsible for parsing a message and looking for special
 * characters (primarily used for color codes). This function will be expanded
 * if necessary in the nearby future.
 */
Utils.parseMessage = message => {
  try {
    const messageBlocks = message.split("@");

    if (messageBlocks.length % 2 === 0) {
      log.warning("Improper message block format!");
      log.warning("Ensure format follows @COLOR@ format.");
      return messageBlocks.join(" ");
    }

    _.each(messageBlocks, (block, index) => {
      if (index % 2 !== 0) {
        // we hit a color code.
        messageBlocks[index] = `<span style="color:${messageBlocks[index]};">`;
      }
    });

    const codeCount = messageBlocks.length / 2 - 1;

    for (let i = 0; i < codeCount; i++) messageBlocks.push("</span>");

    return messageBlocks.join("");
  } catch (e) {
    return "";
  }
};

module.exports = Utils;
