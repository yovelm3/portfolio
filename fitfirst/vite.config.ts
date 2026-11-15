import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// base "./" makes the build work from any sub-path (e.g. GitHub Pages /portfolio/fitfirst/).
export default defineConfig({
  base: "./",
  plugins: [react()],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
