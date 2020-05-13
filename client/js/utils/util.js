/**
 * New version of the Bind Polyfill
 */

// if (!Function.prototype.bind) {
//   Function.prototype.bind = oThis => {
//     if (typeof this !== "function") {
//       // closest thing possible to the ECMAScript 5
//       // internal IsCallable function
//       throw new TypeError(
//         "Function.prototype.bind - what is trying to be bound is not callable"
//       );
//     }

//     const aArgs = Array.prototype.slice.call(arguments, 1);
//     const fToBind = this;
//     const fNOP = () => {};
//     const fBound = () => {
//       return fToBind.apply(
//         this instanceof fNOP ? this : oThis,
//         aArgs.concat(Array.prototype.slice.call(arguments))
//       );
//     };

//     if (this.prototype) {
//       // Function.prototype doesn't have a prototype property
//       fNOP.prototype = this.prototype;
//     }
//     fBound.prototype = new fNOP();

//     return fBound;
//   };
// }

/**
 *
 * @param {number} n
 *
 * @function
 */
export const isInt = n => {
  return n % 1 === 0;
};

/**
 * @constant
 * @type {string}
 * @default
 */
const TRANSITIONEND = "transitionend webkitTransitionEnd oTransitionEnd";

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = (() => {
    return (
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame || // comment out if FF4 is slow (it caps framerate at ~30fps: https://bugzilla.mozilla.org/show_bug.cgi?id=630127)
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      /**
       *
       *
       * @param {FrameRequestCallback} callback
       * @param {HTMLElement} element
       *
       * @function
       */
      function(
        callback,
        element
      ) {
        window.setTimeout(callback, 17);
      }
    );
  })();
}

// if (!String.prototype.startsWith) {
//   String.prototype.startsWith = (searchString, position) => {
//     position = position || 0;
//     return this.substr(position, searchString.length) === searchString;
//   };
// }

// if (!String.prototype.includes) {
//   String.prototype.includes = (search, start) => {
//     "use strict";
//     if (typeof start !== "number") {
//       start = 0;
//     }

//     if (start + search.length > this.length) {
//       return false;
//     } else {
//       return this.indexOf(search, start) !== -1;
//     }
//   };
// }

if (!Array.isArray) {
  Array.isArray = arg => {
    return Object.prototype.toString.call(arg) === "[object Array]";
  };
}

// if (!Array.prototype.includes) {
//   Object.defineProperty(Array.prototype, "includes", {
//     value(searchElement, fromIndex) {
//       // 1. Let O be ? ToObject(this value).
//       if (this == null) {
//         throw new TypeError("\"this\" is null or not defined");
//       }

//       const o = Object(this);

//       // 2. Let len be ? ToLength(? Get(O, "length")).
//       const len = o.length >>> 0;

//       // 3. If len is 0, return false.
//       if (len === 0) {
//         return false;
//       }

//       // 4. Let n be ? ToInteger(fromIndex).
//       //    (If fromIndex is undefined, this step produces the value 0.)
//       const n = fromIndex | 0;

//       // 5. If n ≥ 0, then
//       //  a. Let k be n.
//       // 6. Else n < 0,
//       //  a. Let k be len + n.
//       //  b. If k < 0, let k be 0.
//       let k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

//       function sameValueZero(x, y) {
//         return (
//           x === y ||
//           (typeof x === "number" &&
//             typeof y === "number" &&
//             isNaN(x) &&
//             isNaN(y))
//         );
//       }

//       // 7. Repeat, while k < len
//       while (k < len) {
//         // a. Let elementK be the result of ? Get(O, ! ToString(k)).
//         // b. If SameValueZero(searchElement, elementK) is true, return true.
//         // c. Increase k by 1.
//         if (sameValueZero(o[k], searchElement)) {
//           return true;
//         }
//         k++;
//       }

//       // 8. Return false
//       return false;
//     }
//   });
// }
