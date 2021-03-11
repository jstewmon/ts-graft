module.exports = {
  root: true,
  env: {
    node: true,
  },
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2020,
  },
  plugins: ["prettier"],
  extends: ["eslint:recommended", "prettier"],
  rules: {
    "prettier/prettier": "error",
  },
  overrides: [
    {
      files: ["**/*.ts"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ["./tsconfig.json"],
      },
      plugins: ["@typescript-eslint", "prettier"],
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "prettier",
        "prettier/@typescript-eslint",
      ],
    },
  ],
};
