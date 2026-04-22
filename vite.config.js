import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        publiczny: resolve(process.cwd(), "index.html"),
        admin: resolve(process.cwd(), "admin.html"),
        login: resolve(process.cwd(), "login.html")
      }
    }
  },
  server: {
    open: "/"
  }
});
