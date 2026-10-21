import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite settings. The React plugin lets Vite understand JSX.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, open: true },
  // Chart.js makes the single bundle about 580 kB; that is fine for this app, so don't warn about it.
  build: { chunkSizeWarningLimit: 700 },
});
