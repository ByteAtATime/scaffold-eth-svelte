import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()],
  define: {
    "process.env": {}, // polyfill for web3modal
  },
  server: {
    fs: {
      allow: [".."],
    },
  },
});
