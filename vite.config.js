
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],

  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "framework",
              test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 20,
            },
            {
              name: "router",
              test: /node_modules[\\/](react-router|react-router-dom)[\\/]/,
              priority: 15,
            },
            {
              name: "redux",
              test: /node_modules[\\/](@reduxjs|react-redux|redux|reselect|immer)[\\/]/,
              priority: 15,
            },
            {
              name: "ui-libs",
              test: /node_modules[\\/]swiper[\\/]/,
              priority: 10,
            },
            {
              name: "vendor",
              test: /node_modules[\\/]/,
              priority: 5,
            },
          ],
        },
      },
    },
  },

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

