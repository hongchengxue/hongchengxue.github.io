import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 部署到 GitHub Pages 根路径（https://hongchengxue.github.io）
  base: '/',
  resolve: {
    alias: {
      // 路径别名：import { x } from '@/lib/posts'
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: {
    // 构建时间（ISO 字符串），供「最近更新」等展示；类型声明见 src/types/env.d.ts
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
})
