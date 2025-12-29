import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";
import isDebugMode from "./_is-debug-mode.js";

export default defineConfig({
  plugins: [
    react(),
  ],
  esbuild: {
    target: "es2020",
  },
  define: {
    __DEBUG__: String(isDebugMode()),
  },
  test: {
    include: [
      "tests/**/*.test.ts",
      "tests/**/*.test.tsx",
    ],
    browser: {
      provider: playwright(),
      enabled: true,
      headless: true,
      instances: [
        { browser: "chromium" },
      ],
    },
  },
});
