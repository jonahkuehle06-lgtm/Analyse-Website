import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Absichtlich: State wird beim Mount aus window/Consent gelesen bzw. bei Routenwechsel zurückgesetzt.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  globalIgnores([".next/**", "node_modules/**", "out/**", "build/**", ".claude/**", "next-env.d.ts"]),
]);
