import { defineConfig } from "vite";
import { resolve } from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    base: "/comic-nest/",
    root: "src",
    plugins: [
        tailwindcss(),
        viteStaticCopy({
            targets: [
                { src: "assets/data/**/*", dest: "assets/data" },
                {
                    src: "templates/**/*.html",
                    dest: "templates",
                },
            ],
        }),
    ],
    build: {
        outDir: "../dist",
        emptyOutDir: true,
        minify: "esbuild",
        rollupOptions: {
            input: {
                index: resolve(__dirname, "src/index.html"),
                reader: resolve(__dirname, "src/reader.html"),
                login: resolve(__dirname, "src/login.html"),
            },
            output: {
                // JS chunks and entries go to assets/js
                chunkFileNames: "assets/js/[name]-[hash].js",
                entryFileNames: "assets/js/[name]-[hash].js",
                // CSS files go to assets/css
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name && assetInfo.name.endsWith(".css")) {
                        return "assets/css/[name]-[hash][extname]";
                    }
                    // other assets (images/fonts) stay in their folder
                    return "assets/[name]-[hash][extname]";
                },
            },
        },
    },
});
