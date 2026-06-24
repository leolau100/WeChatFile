<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="donate-overlay" @click.self="$emit('close')">
        <div class="donate-panel">
          <!-- Header -->
          <div class="donate-header">
            <span class="donate-title">☕ 请我喝杯咖啡</span>
            <button class="close-btn" @click="$emit('close')">✕</button>
          </div>

          <!-- Body -->
          <div class="donate-body">
            <p class="donate-desc">
              NiceWeChatFile 完全免费开源。<br>
              如果它帮你节省了时间，欢迎请我喝杯咖啡 ☕
            </p>

            <!-- QR Codes -->
            <div class="qr-row">
              <div class="qr-item">
                <div class="qr-placeholder wechat">
                  <span class="qr-icon">💚</span>
                  <span class="qr-label-small">微信赞赏码</span>
                  <!-- 替换成你的微信收款二维码图片 -->
                  <!-- <img src="/donate/wechat-qr.png" alt="微信赞赏码" /> -->
                  <span class="qr-hint">替换为你的二维码图片</span>
                </div>
                <span class="qr-label">微信支付</span>
              </div>
              <div class="qr-item">
                <div class="qr-placeholder alipay">
                  <span class="qr-icon">💙</span>
                  <span class="qr-label-small">支付宝收款码</span>
                  <!-- 替换成你的支付宝收款二维码图片 -->
                  <!-- <img src="/donate/alipay-qr.png" alt="支付宝收款码" /> -->
                  <span class="qr-hint">替换为你的二维码图片</span>
                </div>
                <span class="qr-label">支付宝</span>
              </div>
            </div>

            <!-- Divider -->
            <div class="donate-divider"></div>

            <!-- Sponsor link (optional) -->
            <div class="donate-alt">
              <span>也可以通过 GitHub Sponsors 支持 →</span>
              <a
                href="https://github.com/YOUR_USERNAME"
                target="_blank"
                rel="noopener noreferrer"
                class="sponsor-link"
              >GitHub Sponsors</a>
            </div>
          </div>

          <!-- Footer -->
          <div class="donate-footer">
            <p>感谢每一位支持者，你的鼓励是持续维护的动力 🙏</p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})
defineEmits(['close'])
</script>

<style scoped>
.donate-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.donate-panel {
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.donate-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.donate-title {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
}

.close-btn {
  background: none;
  border: none;
  font-size: 14px;
  color: #aaa;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.15s;
}
.close-btn:hover {
  background: #f5f5f5;
  color: #666;
}

.donate-body {
  padding: 24px;
}

.donate-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.7;
  text-align: center;
  margin: 0 0 24px;
}

.qr-row {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 20px;
}

.qr-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.qr-placeholder {
  width: 140px;
  height: 140px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 2px dashed #e0e0e0;
  cursor: default;
}
.qr-placeholder.wechat {
  background: #f0fdf4;
  border-color: #86efac;
}
.qr-placeholder.alipay {
  background: #eff6ff;
  border-color: #93c5fd;
}
.qr-placeholder img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 10px;
}

.qr-icon {
  font-size: 24px;
}
.qr-label-small {
  font-size: 11px;
  color: #888;
}
.qr-hint {
  font-size: 10px;
  color: #bbb;
  text-align: center;
  padding: 0 8px;
}

.qr-label {
  font-size: 13px;
  color: #555;
  font-weight: 500;
}

.donate-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 4px 0 16px;
}

.donate-alt {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  color: #888;
  flex-wrap: wrap;
}

.sponsor-link {
  color: #07c160;
  text-decoration: none;
  font-weight: 500;
}
.sponsor-link:hover {
  text-decoration: underline;
}

.donate-footer {
  padding: 12px 24px 20px;
  text-align: center;
}
.donate-footer p {
  font-size: 12px;
  color: #bbb;
  margin: 0;
}

/* Transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-active .donate-panel,
.modal-fade-leave-active .donate-panel {
  transition: transform 0.2s ease;
}
.modal-fade-enter-from .donate-panel,
.modal-fade-leave-to .donate-panel {
  transform: translateY(12px);
}
</style>
