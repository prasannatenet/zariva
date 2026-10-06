
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      "/api": {
        target: "https://astroemerging.com",
        changeOrigin: true,
        secure: true,
        rewrite: (path) =>
          path.replace(/^\/api/, "/gehna/api"),
      },
    },
  },
});

