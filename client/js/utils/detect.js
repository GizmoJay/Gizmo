/**
 * @global
 * @module Detect
 */
const Detect = {};

/**
 * @function isIpad
 * @memberof Detect
 * @instance
 */
Detect.isIpad = () => {
  return /ipad/i.test(navigator.userAgent.toLowerCase());
};

/**
 * @function isAndroid
 * @memberof Detect
 * @instance
 */
Detect.isAndroid = () => {
  return /Android/i.test(navigator.userAgent);
};

/**
 * @function isWindows
 * @memberof Detect
 * @instance
 */
Detect.isWindows = () => {
  return Detect.userAgentContains("Windows");
};

/**
 * @function isFirefox
 * @memberof Detect
 * @instance
 */
Detect.isFirefox = () => {
  return Detect.userAgentContains("Firefox");
};

/**
 * @function isSafari
 * @memberof Detect
 * @instance
 */
Detect.isSafari = () => {
  return (
    Detect.userAgentContains("Safari") && !Detect.userAgentContains("Chrome")
  );
};

/**
 * @function isOpera
 * @memberof Detect
 * @instance
 */
Detect.isOpera = () => {
  return Detect.userAgentContains("Opera");
};

/**
 * @function isInternetExplorer
 * @memberof Detect
 * @instance
 */
Detect.isInternetExplorer = () => {
  return false || !!document.documentMode;
};

/**
 * @function isEdge
 * @memberof Detect
 * @instance
 */
Detect.isEdge = () => {
  return !Detect.isInternetExplorer() && !!window.StyleMedia;
};

/**
 * @function isFirefoxAndroid
 * @memberof Detect
 * @instance
 */
Detect.isFirefoxAndroid = () => {
  return (
    Detect.userAgentContains("Android") && Detect.userAgentContains("Firefox")
  );
};

/**
 * @function userAgentContains
 * @memberof Detect
 * @instance
 */
Detect.userAgentContains = string => {
  return navigator.userAgent.indexOf(string) !== -1;
};

/**
 * @function getUserAgent
 * @memberof Detect
 * @instance
 */
Detect.getUserAgent = () => {
  return navigator.userAgent.toString();
};

/**
 * @function isTablet
 * @memberof Detect
 * @instance
 */
Detect.isTablet = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isAppleTablet = /ipad/i.test(userAgent);
  const isAndroidTablet = /android/i.test(userAgent);

  return (isAppleTablet || isAndroidTablet) && window.innerWidth >= 640;
};

/**
 * @function isMobile
 * @memberof Detect
 * @instance
 */
Detect.isMobile = () => {
  return window.innerWidth < 1000;
};

/**
 * @function iOSVersion
 * @memberof Detect
 * @instance
 */
Detect.iOSVersion = () => {
  if (window.MSStream) {
    // There is some iOS in Windows Phone...
    // https://msdn.microsoft.com/en-us/library/hh869301(v=vs.85).aspx
    return "";
  }
  const match = navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/);
  let version;

  if (match !== undefined && match !== null) {
    version = [
      parseInt(match[1], 10),
      parseInt(match[2], 10),
      parseInt(match[3] || 0, 10)
    ];
    return parseFloat(version.join("."));
  }

  return "";
};

/**
 * @function androidVersion
 * @memberof Detect
 * @instance
 */
Detect.androidVersion = () => {
  const userAgent = navigator.userAgent.split("Android");
  let version;

  if (userAgent.length > 1) {
    version = userAgent[1].split(";")[0];
  }

  return version;
};

/**
 * @function supportsWebGL
 * @memberof Detect
 * @instance
 */
Detect.supportsWebGL = () => {
  // let canvas = document.createElement('canvas'),
  //    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  return false;
};

/**
 * @function isAppleDevice
 * @memberof Detect
 * @instance
 */
Detect.isAppleDevice = () => {
  const devices = [
    "iPad Simulator",
    "iPhone Simulator",
    "iPod Simulator",
    "iPad",
    "iPhone",
    "iPod"
  ];

  if (navigator.platform) {
    while (devices.length) {
      if ((navigator.platform = devices.pop())) {
        return true;
      }
    }
  }

  return false;
};

/**
 * @function isOldAndroid
 * @memberof Detect
 * @instance
 */
// Older mobile devices will default to non-centred camera mode
Detect.isOldAndroid = () => {
  return parseFloat(Detect.androidVersion() < 6.0);
};

/**
 * @function isOldApple
 * @memberof Detect
 * @instance
 */
Detect.isOldApple = () => {
  return parseFloat(Detect.iOSVersion() < 9.0);
};

/**
 * @function useCenteredCamera
 * @memberof Detect
 * @instance
 */
Detect.useCenteredCamera = () => {
  return Detect.isOldAndroid() || Detect.isOldApple() || Detect.isIpad();
};

export default Detect;
