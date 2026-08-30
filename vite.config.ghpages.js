import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

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

// GitHub Pages 部署配置
// 项目页地址：https://leolau100.github.io/NiceWechatArticle/
// 因此 base 必须是仓库名子路径 /NiceWechatArticle/
// 如果你绑定了自定义域名并希望挂在 /md/ 下，把这个值改回 '/md/' 即可
export default defineConfig({
  base: '/NiceWechatArticle/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  define: {
    __DEPLOY_TIME__: JSON.stringify(deployTime)
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
