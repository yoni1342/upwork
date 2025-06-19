// eslint.config.js
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      react
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "no-unused-vars": "warn"
    }
  }
]
