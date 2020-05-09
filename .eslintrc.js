module.exports = {
  root: true,
  env: {
    // REVIEW: Server Conversion?
    commonjs: true,

    browser: true,
    jquery: true,
    es6: true,
    node: true
  },
  extends: ["eslint:recommended", "standard"],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly"
  },
  parser: "babel-eslint",
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module"
  },
  rules: {
    // "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-new": "off",
    semi: ["warn", "always"],
    quotes: ["warn", "double"],

    "no-unused-vars": "off",
    "no-undef": "off",
    "standard/no-callback-literal": "off",

    // Just styling; unimportant
    "new-cap": "warn",
    camelcase: "warn",
    "brace-style": "warn",
    "block-spacing": "warn",
    "space-before-blocks": "warn",
    "no-trailing-spaces": "warn",
    "space-before-function-paren": ["warn", "never"],
    indent: [
      "warn",
      2,
      {
        SwitchCase: 1,
        flatTernaryExpressions: true
      }
    ]
  },
  ignorePatterns: [
    "node_modules/",
    "dist/",
    "client-dist",
    "lib/",
    "*.min.*",
    "client/data/",
    "~*"
  ]
};
