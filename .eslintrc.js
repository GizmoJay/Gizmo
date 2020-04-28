module.exports = {
  env: {
    // TODO: Conversion
    amd: true,
    commonjs: true,

    browser: true,
    jquery: true,
    es6: true,
    node: true
  },
  extends: ["standard"],
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
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    semi: ["warn", "always"],
    quotes: ["warn", "double"],

    /**
     * TODO: The Big Linting.
     * Fix these by uncommenting the line or changing the value from "off", and linting each file.
     */
    "no-tabs": "off",
    "no-unused-vars": "off",
    "no-unused-expressions": "off",
    "no-sequences": "off",
    "no-undef": "off",
    "no-useless-escape": "off",
    "no-redeclare": "off",
    "no-mixed-operators": "off",
    "no-cond-assign": "off",
    "no-prototype-builtins": "off",
    "no-extend-native": "off",
    "new-cap": "off",
    camelcase: "off",
    eqeqeq: "off",
    "no-void": "off",
    "no-labels": "off",
    "accessor-pairs": "off",
    "brace-style": "off",
    "no-mixed-operators": "off",
    "no-return-assign": "off",
    "no-use-before-define": "off",
    "no-useless-call": "off",
    "standard/no-callback-literal": "off",
    "no-mixed-spaces-and-tabs": "off",
    "no-use-before-define": "off",
    "no-new-func": "off",
    "no-self-compare": "off",
    "no-caller": "off",
    "no-eval": "off",
    "no-new-wrappers": "off",
    "no-useless-call": "off",
    "no-new-wrappers": "off",
    "valid-typeof": "off",
    "no-self-assign": "off",
    "no-lone-blocks": "off",
    "no-self-compare": "off",
    "no-useless-call": "off",
    "no-control-regex": "off",
    "no-caller": "off",
    "no-fallthrough": "off",
    "no-case-declarations": "off",

    // Just styling; unimportant
    "space-before-function-paren": ["warn", "never"],
    indent: [
      "off",
      2,
      {
        SwitchCase: 1,
        flatTernaryExpressions: true
      }
    ]
  }
};
