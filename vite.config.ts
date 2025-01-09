import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: "https://github.com/ginger1541/Grade-calculator.git",  
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
