<template>
  <div class="about-container">
    <div class="about-card">
      <!-- Back -->
      <button class="back-btn" @click="router.push('/')">← 返回首页</button>

      <!-- Logo & Title -->
      <div class="about-logo">✍️</div>
      <h1>NiceWeChatFile</h1>
      <p class="about-tagline">Markdown → 微信公众号，让写作更高效</p>

      <!-- Badges -->
      <div class="badge-row">
        <a
          :href="GITHUB_URL"
          target="_blank"
          rel="noopener noreferrer"
          class="badge badge-github"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          GitHub
        </a>
        <a
          href="#"
          @click.prevent="showDonate = true"
          class="badge badge-donate"
        >☕ 请我喝咖啡</a>
        <span class="badge badge-version">v2.0.0</span>
        <span class="badge badge-license">MIT License</span>
      </div>

      <!-- Description -->
      <div class="about-section">
        <h2>关于这个项目</h2>
        <p>
          NiceWeChatFile 是一个开源的微信公众号 Markdown 编辑器，支持实时预览、多主题切换、顶部/底部模版管理，以及一键复制为微信兼容格式。
        </p>
        <p>
          同时支持作为 Chrome 浏览器插件使用，在任何页面快速调用编辑器。
        </p>
      </div>

      <!-- Features -->
      <div class="about-section">
        <h2>主要功能</h2>
        <ul class="feature-list">
          <li>📝 支持完整 Markdown 语法</li>
          <li>🎨 60+ 款精美主题样式</li>
          <li>📋 一键复制，直接粘贴到微信公众号</li>
          <li>⚡ 实时预览，所见即所得</li>
          <li>🔖 顶部 / 底部模版管理</li>
          <li>🧩 支持 Chrome 插件形态</li>
          <li>💾 本地自动保存，无需登录</li>
        </ul>
      </div>

      <!-- Links -->
      <div class="about-section">
        <h2>链接</h2>
        <div class="link-list">
          <a :href="GITHUB_URL" target="_blank" rel="noopener noreferrer" class="link-item">
            <span class="link-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </span>
            <span class="link-text">
              <span class="link-title">GitHub 仓库</span>
              <span class="link-desc">查看源码、提 Issue、贡献代码</span>
            </span>
            <span class="link-arrow">→</span>
          </a>
          <a :href="`${GITHUB_URL}/issues`" target="_blank" rel="noopener noreferrer" class="link-item">
            <span class="link-icon">🐛</span>
            <span class="link-text">
              <span class="link-title">反馈问题</span>
              <span class="link-desc">遇到 bug 或有功能建议？欢迎提 Issue</span>
            </span>
            <span class="link-arrow">→</span>
          </a>
          <a href="#" @click.prevent="showDonate = true" class="link-item">
            <span class="link-icon">☕</span>
            <span class="link-text">
              <span class="link-title">请我喝咖啡</span>
              <span class="link-desc">如果这个工具帮到了你，欢迎赞赏支持</span>
            </span>
            <span class="link-arrow">→</span>
          </a>
        </div>
      </div>

      <!-- Author -->
      <div class="about-section">
        <h2>作者</h2>
        <div class="author-card">
          <div class="author-avatar">👤</div>
          <div class="author-info">
            <span class="author-name">YOUR_NAME</span>
            <span class="author-bio">替换为你的个人简介</span>
            <div class="author-links">
              <a :href="GITHUB_URL" target="_blank" rel="noopener noreferrer">GitHub</a>
              <!-- 可以添加更多社交链接 -->
              <!-- <a href="https://twitter.com/YOUR_HANDLE" target="_blank">Twitter</a> -->
              <!-- <a href="https://weibo.com/YOUR_HANDLE" target="_blank">微博</a> -->
            </div>
          </div>
        </div>
      </div>

      <!-- License -->
      <div class="about-footer">
        <p>基于 <a :href="`${GITHUB_URL}/blob/main/LICENSE`" target="_blank" rel="noopener noreferrer">MIT License</a> 开源</p>
        <p>© 2024 YOUR_NAME · Made with ❤️</p>
      </div>
    </div>

    <!-- Donate Modal -->
    <DonateModal :visible="showDonate" @close="showDonate = false" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import DonateModal from '../components/DonateModal.vue'

const router = useRouter()
const showDonate = ref(false)

// 替换为你的 GitHub 仓库地址
const GITHUB_URL = 'https://github.com/YOUR_USERNAME/NiceWeChatFile'
</script>

<style scoped>
.about-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 40px 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', sans-serif;
}

.about-card {
  background: #fff;
  border-radius: 20px;
  padding: 40px;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  position: relative;
}

.back-btn {
  background: none;
  border: 1px solid #e5e7eb;
  color: #666;
  font-size: 13px;
  padding: 6px 14px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 28px;
  transition: all 0.15s;
}
.back-btn:hover {
  background: #f9fafb;
  color: #333;
}

.about-logo {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #07c160, #05a050);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  margin: 0 auto 16px;
}

h1 {
  text-align: center;
  font-size: 26px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px;
}

.about-tagline {
  text-align: center;
  font-size: 14px;
  color: #888;
  margin: 0 0 24px;
}

/* Badges */
.badge-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-bottom: 32px;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-decoration: none;
  transition: opacity 0.15s;
}
.badge:hover { opacity: 0.8; }

.badge-github {
  background: #1a1a1a;
  color: #fff;
}
.badge-donate {
  background: #fff7ed;
  color: #c2410c;
  border: 1px solid #fed7aa;
  cursor: pointer;
}
.badge-version {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}
.badge-license {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
}

/* Sections */
.about-section {
  margin-bottom: 28px;
  padding-bottom: 28px;
  border-bottom: 1px solid #f3f4f6;
}
.about-section:last-of-type {
  border-bottom: none;
}

.about-section h2 {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 12px;
}

.about-section p {
  font-size: 14px;
  color: #555;
  line-height: 1.7;
  margin: 0 0 8px;
}
.about-section p:last-child { margin-bottom: 0; }

/* Feature list */
.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.feature-list li {
  font-size: 13px;
  color: #555;
  padding: 6px 0;
}

/* Link list */
.link-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.link-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  text-decoration: none;
  transition: background 0.15s;
  cursor: pointer;
}
.link-item:hover {
  background: #f9fafb;
}
.link-icon {
  font-size: 18px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 8px;
  color: #555;
  flex-shrink: 0;
}
.link-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.link-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}
.link-desc {
  font-size: 12px;
  color: #999;
}
.link-arrow {
  font-size: 14px;
  color: #ccc;
}

/* Author */
.author-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
}
.author-avatar {
  font-size: 32px;
  width: 48px;
  height: 48px;
  background: #e5e7eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.author-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.author-name {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a1a;
}
.author-bio {
  font-size: 13px;
  color: #888;
}
.author-links {
  display: flex;
  gap: 10px;
  margin-top: 4px;
}
.author-links a {
  font-size: 12px;
  color: #07c160;
  text-decoration: none;
}
.author-links a:hover {
  text-decoration: underline;
}

/* Footer */
.about-footer {
  text-align: center;
  padding-top: 8px;
}
.about-footer p {
  font-size: 12px;
  color: #bbb;
  margin: 0 0 4px;
}
.about-footer a {
  color: #07c160;
  text-decoration: none;
}
.about-footer a:hover {
  text-decoration: underline;
}
</style>
