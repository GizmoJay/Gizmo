/**
 *
 *
 * @param {string} level
 *
 * @module
 */
const Logger = function (level) {
  this.level = level;
};

/**
 *
 *
 * @param {string} message
 *
 * @function info
 * @memberof Logger
 * @instance
 */
Logger.prototype.info = function (message) {
  if (this.level === "debug" || this.level === "info") {
    if (window.console) {
      console.info(message);
    }
  }
};

/**
 *
 *
 * @param {string} message
 *
 * @function debug
 * @memberof Logger
 * @instance
 */
Logger.prototype.debug = function (message) {
  if (this.level === "debug") {
    if (window.console) {
      console.log(message);
    }
  }
};

/**
 *
 *
 * @param {string} message
 *
 * @function error
 * @memberof Logger
 * @instance
 */
Logger.prototype.error = function (message, stacktrace) {
  if (window.console) {
    console.error(message);
    if (stacktrace !== undefined && stacktrace === true) {
      var trace = printStackTrace();
      console.error(trace.join("\n\n"));
      console.error("-----------------------------");
    }
  }
};

/**
 * @global
 */
log = new Logger("debug");
