<template>
  <div class="home-container">
    <div class="container">
      <div class="logo">✍️</div>
      <h1>微信文章编辑器</h1>
      <p class="subtitle">Markdown → 微信公众号，让写作更高效</p>
      
      <div class="features">
        <div class="feature-item">
          <span class="feature-icon">📝</span>
          <span>支持完整 Markdown 语法</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">🎨</span>
          <span>14 款精美主题样式</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">📋</span>
          <span>一键复制到微信公众号</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">⚡</span>
          <span>实时预览，所见即所得</span>
        </div>
      </div>
      
      <button class="btn" @click="goToEditor">
        <span>🚀</span>
        <span>开始写作</span>
      </button>
      
      <div class="footer">
        <p>也可以安装为 <a href="#" @click.prevent="showExtInfo">Chrome 浏览器插件</a></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goToEditor() {
  router.push('/editor')
}

function showExtInfo() {
  alert('安装浏览器插件方法：\n\n1. 打开 Chrome 浏览器\n2. 访问 chrome://extensions/\n3. 开启「开发者模式」\n4. 点击「加载已解压的扩展程序」\n5. 选择当前项目文件夹');
}
</script>

<style scoped>
.home-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow: auto;
}
.container {
  text-align: center;
  background: #fff;
  border-radius: 20px;
  padding: 60px 40px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  max-width: 500px;
  width: 100%;
}
.logo {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #07c160, #05a050);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  font-size: 36px;
}
h1 {
  font-size: 28px;
  color: #1a1a1a;
  margin-bottom: 12px;
  font-weight: 600;
}
.subtitle {
  font-size: 14px;
  color: #888;
  margin-bottom: 32px;
  line-height: 1.6;
}
.features {
  text-align: left;
  margin-bottom: 32px;
  padding-left: 8px;
}
.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  font-size: 14px;
  color: #555;
}
.feature-icon {
  width: 28px;
  height: 28px;
  background: #f0fdf4;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #07c160;
  flex-shrink: 0;
}
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 32px;
  background: linear-gradient(135deg, #07c160, #06ad56);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 16px rgba(7,193,96,0.4);
}
.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(7,193,96,0.5);
}
.btn:active {
  transform: translateY(0);
}
.footer {
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
  font-size: 12px;
  color: #bbb;
}
.footer a {
  color: #07c160;
  text-decoration: none;
}
.footer a:hover {
  text-decoration: underline;
}
</style>
