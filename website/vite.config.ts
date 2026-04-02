import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(() => {
  const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1];
  const ciBase = process.env.GITHUB_ACTIONS && repoName ? `/${repoName}/` : "/";
  const base = process.env.VITE_BASE_PATH || ciBase;

  return {
    plugins: [react()],
    base,
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("world-countries")) {
              return "country-names";
            }

            if (id.includes("react-globe.gl") || id.includes("globe.gl") || id.includes("three")) {
              return "globe-vendor";
            }

            if (id.includes("world-atlas") || id.includes("topojson-client")) {
              return "geo-data";
            }

            return undefined;
          },
        },
      },
    },
  };
});
