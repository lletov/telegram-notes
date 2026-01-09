import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],      // массив плагинов — всё правильно
  base: '/telegram-notes/', // путь к репозиторию для GitHub Pages
});