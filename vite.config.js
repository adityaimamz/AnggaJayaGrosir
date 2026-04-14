import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    server: {
        // Bind dev server locally to reduce exposure when running Vite during development.
        host: '127.0.0.1',
        allowedHosts: ['localhost', '127.0.0.1'],
        cors: {
            origin: /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/,
        },
    },
});
