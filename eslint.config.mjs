import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactNative from "eslint-plugin-react-native";
import unusedImports from "eslint-plugin-unused-imports";
import prettierConfig from "eslint-config-prettier";

export default [
  js.configs.recommended,
  // React Native mobile app configuration
  {
    files: ["apps/mobile/**/*.{js,jsx,ts,tsx}"],
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
      "no-console": "off",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  // Cloud Functions configuration (Node.js specific)
  {
    files: ["apps/functions/**/*.{js,ts}"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        sourceType: "module",
      },
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        global: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
      "unused-imports": unusedImports,
    },
    rules: {
      ...typescript.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": "off", // unused-importsで処理
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": ["error", {argsIgnorePattern: "^_"}],
      quotes: ["error", "double"],
      indent: ["error", 2],
      "max-len": ["error", {code: 120}],
      "@typescript-eslint/no-explicit-any": ["error", {ignoreRestArgs: true}],
      "no-console": "off",
    },
  },
  // General TypeScript configuration (for other files)
  {
    files: ["**/*.{js,ts}"],
    ignores: ["apps/**/*"], // Skip since handled by app-specific configs above
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: "module",
      },
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        global: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        NodeJS: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
      "unused-imports": unusedImports,
    },
    rules: {
      ...typescript.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": ["warn", {argsIgnorePattern: "^_", varsIgnorePattern: "^_"}],
      "@typescript-eslint/no-explicit-any": "warn",
      "no-console": "off",
    },
  },
  // Test files configuration
  {
    files: ["**/__tests__/**/*.ts", "**/*.test.ts", "**/*.test.tsx", "**/jest-setup.js", "**/jest.config.js"],
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
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // Allow any in tests
      "@typescript-eslint/no-require-imports": "off", // Allow require in test setup
      "unused-imports/no-unused-vars": "off", // Allow unused vars in test setup
    },
  },
  // Global ignores
  {
    ignores: [
      "node_modules/",
      "dist/",
      ".expo/",
      "android/",
      "ios/",
      ".husky/",
      "lib/",
      "apps/functions/lib/**/*",
      "apps/functions/generated/**/*",
      "apps/functions/jest.config.js",
      "apps/functions/eslint.config.js",
    ],
  },
  prettierConfig,
];
