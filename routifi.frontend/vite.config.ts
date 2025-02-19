import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    
  },
  server: {
    host: "127.0.0.1", // ✅ Bind to 127.0.0.1 instead of localhost
    port: 5173, // Change if needed
  },
})
