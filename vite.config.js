import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 构建时记录部署时间（北京时间），每次 build 都会刷新
const deployTime = new Date().toLocaleString('zh-CN', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
})

export default defineConfig({
  base: '/md/',
  plugins: [vue()],
  define: {
    __DEPLOY_TIME__: JSON.stringify(deployTime)
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
