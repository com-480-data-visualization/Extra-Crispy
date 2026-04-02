import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig(function () {
    var _a;
    var repoName = (_a = process.env.GITHUB_REPOSITORY) === null || _a === void 0 ? void 0 : _a.split("/")[1];
    var ciBase = process.env.GITHUB_ACTIONS && repoName ? "/".concat(repoName, "/") : "/";
    var base = process.env.VITE_BASE_PATH || ciBase;
    return {
        plugins: [react()],
        base: base,
        build: {
            rollupOptions: {
                output: {
                    manualChunks: function (id) {
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
