import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactNative from "eslint-plugin-react-native";
import unusedImports from "eslint-plugin-unused-imports";
import prettierConfig from "eslint-config-prettier";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 2021,
        sourceType: "module",
      },
      globals: {
        __DEV__: "readonly",
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        global: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        window: "readonly",
        navigator: "readonly",
        alert: "readonly",
        fetch: "readonly",
        NodeJS: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
      react,
      "react-native": reactNative,
      "unused-imports": unusedImports,
    },
    rules: {
      ...typescript.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": "off", // unused-importsで処理
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": ["warn", {argsIgnorePattern: "^_", varsIgnorePattern: "^_"}],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-require-imports": "warn",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    files: ["**/__tests__/**/*.ts", "**/*.test.ts", "**/*.test.tsx"],
    languageOptions: {
      globals: {
        jest: "readonly",
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
      },
    },
  },
  {
    ignores: ["dist/", "node_modules/", ".expo/", "android/", "ios/"],
  },
  prettierConfig,
];
