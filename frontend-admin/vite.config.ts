import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    allowedHosts: ["admin.dhairyapatel.me", "www.admin.dhairyapatel.me"],
    proxy: {
      "/api": {
        target: process.env.VITE_BACKEND_API || "http://backend:8080",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
