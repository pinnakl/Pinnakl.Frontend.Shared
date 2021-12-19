module.exports = {
  "env": {
    "browser": true,
    "es6": true,
    "node": true
  },
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "tsconfig.json",
    "sourceType": "module"
  },
  "plugins": [
    "@angular-eslint/eslint-plugin",
    "@typescript-eslint"
  ],
  "rules": {
    "prefer-arrow/prefer-arrow-functions": "off",
    "jsdoc/no-types": "off",
    "@typescript-eslint/indent": "off",
    "@typescript-eslint/member-delimiter-style": "off",
    "object-shorthand": "off",
    "@typescript-eslint/member-ordering": "off",
    "@typescript-eslint/naming-convention": "off",
    "@angular-eslint/directive-class-suffix": "off",
    "brace-style": "off",
    "arrow-body-style": "off",
    "@typescript-eslint/semi": "off",
    "@typescript-eslint/type-annotation-spacing": "off",
    "no-shadow": "warn",
    "spaced-comment": "off",
    "eqeqeq": "off",
    "@typescript-eslint/no-unused-expressions": "off",
    "@typescript-eslint/no-inferrable-types": "off",
    "max-classes-per-file": [
      "warn",
      5
    ],
    "max-len": [
      "error",
      {
        "code": 250
      }
    ],
    "comma-dangle": "off",
    "@angular-eslint/component-class-suffix": "error",
    "@angular-eslint/no-host-metadata-property": "off",
    "@angular-eslint/no-input-rename": "error",
    "@angular-eslint/no-inputs-metadata-property": "error",
    "@angular-eslint/no-output-on-prefix": "off",
    "@angular-eslint/no-output-rename": "off",
    "@angular-eslint/no-outputs-metadata-property": "error",
    "@angular-eslint/use-lifecycle-interface": "error",
    "@angular-eslint/use-pipe-transform-interface": "error",
    "@typescript-eslint/consistent-type-definitions": "off",
    "@typescript-eslint/dot-notation": "off",
    "@typescript-eslint/explicit-member-accessibility": [
      "off",
      {
        "accessibility": "explicit"
      }
    ],
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-empty-interface": "off",
    "@typescript-eslint/no-misused-new": "error",
    "@typescript-eslint/no-non-null-assertion": "error",
    "@typescript-eslint/prefer-function-type": "error",
    "@typescript-eslint/quotes": [
      "error",
      "single",
      {
        "allowTemplateLiterals": true
      }
    ],
    "@typescript-eslint/unified-signatures": "error",
    "constructor-super": "error",
    "curly": "error",
    "eol-last": "off",
    "guard-for-in": "off",
    "id-blacklist": "off",
    "id-match": "off",
    "new-parens": "error",
    "no-bitwise": "error",
    "no-caller": "error",
    "no-console": [
      "error",
      {
        "allow": [
          "log",
          "warn",
          "dir",
          "timeLog",
          "assert",
          "clear",
          "count",
          "countReset",
          "group",
          "groupEnd",
          "table",
          "dirxml",
          "error",
          "groupCollapsed",
          "Console",
          "profile",
          "profileEnd",
          "timeStamp",
          "context"
        ]
      }
    ],
    "no-debugger": "error",
    "no-empty": "off",
    "no-eval": "error",
    "no-fallthrough": "error",
    "no-multiple-empty-lines": [
      "error",
      {
        "max": 2
      }
    ],
    "no-new-wrappers": "error",
    "no-restricted-imports": [
      "error",
      "rxjs/Rx"
    ],
    "no-throw-literal": "off",
    "no-trailing-spaces": "error",
    "no-undef-init": "error",
    "no-underscore-dangle": "off",
    "no-unused-labels": "error",
    "no-var": "warn",
    "prefer-const": "warn",
    "radix": "off"
  }
};
