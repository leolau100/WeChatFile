<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="donate-overlay" @click.self="$emit('close')">
        <div class="donate-panel">

          <!-- Header -->
          <div class="donate-header">
            <span class="donate-title">☕ 请我喝杯咖啡</span>
            <button class="close-btn" @click="$emit('close')" aria-label="关闭">✕</button>
          </div>

          <!-- Body -->
          <div class="donate-body">
            <p class="donate-desc">
              NiceWeChatFile 完全免费开源。<br>
              如果它帮你节省了时间，欢迎请我喝杯咖啡 ☕
            </p>

            <!-- Tabs -->
            <div class="donate-tabs">
              <button
                class="donate-tab"
                :class="{ active: activeTab === 'wechat' }"
                @click="activeTab = 'wechat'"
              >
                <span class="tab-icon">💚</span> 微信支付
              </button>
              <button
                class="donate-tab"
                :class="{ active: activeTab === 'alipay' }"
                @click="activeTab = 'alipay'"
              >
                <span class="tab-icon">💙</span> 支付宝
              </button>
              <button
                class="donate-tab"
                :class="{ active: activeTab === 'wechat-add' }"
                @click="activeTab = 'wechat-add'"
              >
                <span class="tab-icon">🤝</span> 加微信
              </button>
            </div>

            <!-- QR Image -->
            <div class="qr-wrap">
              <Transition name="qr-fade" mode="out-in">
                <div :key="activeTab" class="qr-img-box">
                  <img
                    v-if="activeTab === 'wechat'"
                    src="/donate/wechat-pay.jpg"
                    alt="微信收款码"
                    class="qr-img"
                  />
                  <img
                    v-else-if="activeTab === 'alipay'"
                    src="/donate/alipay-pay.jpg"
                    alt="支付宝收款码"
                    class="qr-img"
                  />
                  <img
                    v-else
                    src="/donate/wechat-add.jpg"
                    alt="微信号二维码"
                    class="qr-img"
                  />
                </div>
              </Transition>
              <p class="qr-hint" v-if="activeTab === 'wechat'">打开微信「扫一扫」付款</p>
              <p class="qr-hint" v-else-if="activeTab === 'alipay'">打开支付宝「扫一扫」付款</p>
              <p class="qr-hint" v-else>扫码添加微信好友 · DoublePoint</p>
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
import { ref } from 'vue'

defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})
defineEmits(['close'])

const activeTab = ref('wechat')
</script>

<style scoped>
.donate-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.donate-panel {
  background: #fff;
  border-radius: 18px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.22);
  overflow: hidden;
}

/* Header */
.donate-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 28px 16px;
  border-bottom: 1px solid #f0f0f0;
}
.donate-title {
  font-size: 17px;
  font-weight: 700;
  color: #1a1a1a;
}
.close-btn {
  background: none;
  border: none;
  font-size: 13px;
  color: #aaa;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.15s, color 0.15s;
  line-height: 1;
}
.close-btn:hover {
  background: #f5f5f5;
  color: #555;
}

/* Body */
.donate-body {
  padding: 24px 28px 0;
}
.donate-desc {
  font-size: 14px;
  color: #888;
  line-height: 1.7;
  text-align: center;
  margin: 0 0 20px;
}

/* Tabs */
.donate-tabs {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 20px;
}
.donate-tab {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 18px;
  border-radius: 20px;
  border: 1.5px solid #e5e7eb;
  background: #fff;
  font-size: 13px;
  font-weight: 500;
  color: #888;
  cursor: pointer;
  transition: all 0.15s;
}
.donate-tab:hover {
  border-color: #07c160;
  color: #07c160;
}
.donate-tab.active {
  background: #07c160;
  border-color: #07c160;
  color: #fff;
}
.tab-icon {
  font-size: 14px;
}

/* QR Image */
.qr-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 4px;
}
.qr-img-box {
  width: 340px;
  height: 340px;
  border-radius: 14px;
  overflow: hidden;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}
.qr-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.qr-hint {
  font-size: 13px;
  color: #aaa;
  margin: 12px 0 0;
  text-align: center;
}

/* Footer */
.donate-footer {
  padding: 16px 28px 22px;
  text-align: center;
  border-top: 1px solid #f5f5f5;
  margin-top: 20px;
}
.donate-footer p {
  font-size: 13px;
  color: #bbb;
  margin: 0;
}

/* Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-active .donate-panel {
  transition: transform 0.2s ease;
}
.modal-fade-enter-from .donate-panel {
  transform: translateY(16px);
}

.qr-fade-enter-active,
.qr-fade-leave-active {
  transition: opacity 0.15s ease;
}
.qr-fade-enter-from,
.qr-fade-leave-to {
  opacity: 0;
}
</style>
