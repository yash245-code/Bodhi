import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin({ exclude: [] })],
    resolve: {
      alias: {
        '@shared': resolve(__dirname, '../shared')
      }
    },
    build: {
      lib: {
        entry: resolve(__dirname, '../backend/index.ts')
      },
      rollupOptions: {
        external: ['node-pty', 'chokidar']
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@shared': resolve(__dirname, '../shared')
      }
    },
    build: {
      lib: {
        entry: resolve(__dirname, '../preload/index.ts')
      }
    }
  },
  renderer: {
    root: resolve(__dirname, '../frontend'),
    resolve: {
      alias: {
        '@renderer': resolve(__dirname, '../frontend/src'),
        '@shared': resolve(__dirname, '../shared')
      }
    },
    build: {
      rollupOptions: {
        input: resolve(__dirname, '../frontend/index.html')
      }
    },
    css: {
      postcss: resolve(__dirname, 'postcss.config.cjs')
    },
    plugins: [react()]
  }
})
