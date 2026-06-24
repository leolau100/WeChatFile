<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div class="svgfx-overlay" @click.self="$emit('close')">
        <div class="svgfx-panel">

          <!-- Header -->
          <div class="svgfx-header">
            <div class="svgfx-title">
              <span class="svgfx-icon">✦</span>
              SVG 动效素材库
            </div>
            <button class="btn-close" @click="$emit('close')">✕</button>
          </div>

          <!-- Body -->
          <div class="svgfx-body">
            <div class="svgfx-grid">
              <div
                v-for="effect in effects"
                :key="effect.id"
                class="svgfx-card"
                :class="{ active: selectedEffect?.id === effect.id }"
                @click="selectEffect(effect)"
              >
                <div class="svgfx-preview" v-html="effect.preview"></div>
                <div class="svgfx-name">{{ effect.name }}</div>
                <div class="svgfx-desc">{{ effect.desc }}</div>
              </div>
            </div>

            <!-- Editor -->
            <Transition name="slide-fade">
              <div v-if="selectedEffect" class="svgfx-editor">
                <div class="svgfx-editor-header">
                  <span class="svgfx-editor-title">{{ selectedEffect.name }}</span>
                  <button class="btn-close-sm" @click="selectedEffect = null">✕</button>
                </div>

                <div class="svgfx-fields">
                  <div
                    v-for="field in selectedEffect.fields"
                    :key="field.key"
                    class="svgfx-field"
                  >
                    <label>{{ field.label }}</label>
                    <textarea
                      v-if="field.type === 'textarea'"
                      v-model="fieldValues[field.key]"
                      :placeholder="field.placeholder"
                      :rows="field.rows || 2"
                      class="svgfx-input svgfx-textarea"
                    ></textarea>
                    <input
                      v-else
                      v-model="fieldValues[field.key]"
                      :type="field.type || 'text'"
                      :placeholder="field.placeholder"
                      class="svgfx-input"
                    />
                  </div>
                </div>

                <div class="svgfx-preview-box">
                  <div class="svgfx-preview-label">预览效果</div>
                  <div class="svgfx-preview-content" v-html="generatedPreview"></div>
                </div>

                <div class="svgfx-actions">
                  <button class="btn btn-primary" @click="insertCode">📥 插入编辑器</button>
                  <button class="btn btn-secondary" @click="selectedEffect = null">返回选择</button>
                </div>
              </div>
            </Transition>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'

const emit = defineEmits(['close', 'insert'])

const selectedEffect = ref(null)
const fieldValues = reactive({})

const effects = [
  {
    id: 'rainbow-text',
    name: '渐变文字',
    desc: '彩虹渐变色标题文字',
    preview: '<span style="font-size:22px;font-weight:900;background:linear-gradient(90deg,#ff6b6b,#feca57,#48dbfb,#ff9ff3,#54a0ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">彩虹渐变文字</span>',
    fields: [
      { key: 'text', label: '文字内容', placeholder: '请输入渐变文字', type: 'text' },
      { key: 'fontSize', label: '字体大小', placeholder: '24px', type: 'text' },
      { key: 'align', label: '对齐方式', placeholder: 'center', type: 'text' }
    ],
    defaults: { text: '彩虹渐变文字', fontSize: '24px', align: 'center' }
  },
  {
    id: 'barrage',
    name: '弹幕效果',
    desc: '横向滚动弹幕文字',
    preview: '<span style="display:inline-block;font-size:16px;font-weight:600;color:#667eea;white-space:nowrap;">弹幕滚动中~~~</span>',
    fields: [
      { key: 'text', label: '弹幕文字', placeholder: '请输入弹幕内容', type: 'text' },
      { key: 'color', label: '文字颜色', placeholder: '#667eea', type: 'text' },
      { key: 'fontSize', label: '字体大小', placeholder: '16px', type: 'text' }
    ],
    defaults: { text: '这是一条滚动弹幕~~~', color: '#667eea', fontSize: '16px' }
  },
  {
    id: 'click-expand',
    name: '点击展开',
    desc: '点击按钮展开/收起内容',
    preview: '<div style="text-align:center;"><span style="display:inline-block;padding:8px 24px;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border-radius:20px;font-size:13px;font-weight:600;cursor:pointer;">▼ 点击展开</span></div>',
    fields: [
      { key: 'title', label: '按钮文字', placeholder: '点击展开更多', type: 'text' },
      { key: 'content', label: '展开内容', placeholder: '这里是展开后的详细内容...', type: 'textarea', rows: 4 },
      { key: 'btnColor', label: '按钮颜色', placeholder: '#667eea', type: 'text' }
    ],
    defaults: { title: '点击展开更多', content: '这里是展开后的详细内容，支持多行文字。你可以在这里填写需要展示的隐藏信息。', btnColor: '#667eea' }
  },
  {
    id: 'pulse',
    name: '脉冲动画',
    desc: '呼吸灯缩放效果',
    preview: '<span style="display:inline-block;font-size:16px;color:#e74c3c;font-weight:700;">● 脉冲提示</span>',
    fields: [
      { key: 'text', label: '提示文字', placeholder: '请输入提示文字', type: 'text' },
      { key: 'color', label: '强调色', placeholder: '#e74c3c', type: 'text' },
      { key: 'fontSize', label: '字体大小', placeholder: '16px', type: 'text' }
    ],
    defaults: { text: '🔥 限时特惠进行中', color: '#e74c3c', fontSize: '16px' }
  },
  {
    id: 'typewriter',
    name: '打字机效果',
    desc: '逐字出现的打字动画',
    preview: '<span style="display:inline-block;font-size:16px;color:#333;font-family:monospace;border-right:2px solid #333;padding-right:4px;">打字机效果...</span>',
    fields: [
      { key: 'text', label: '文字内容', placeholder: '请输入要逐字显示的文字', type: 'textarea', rows: 3 },
      { key: 'fontSize', label: '字体大小', placeholder: '16px', type: 'text' },
      { key: 'color', label: '文字颜色', placeholder: '#333', type: 'text' }
    ],
    defaults: { text: '正在输入中...', fontSize: '16px', color: '#333' }
  }
]

function selectEffect(effect) {
  selectedEffect.value = effect
  // Reset field values to defaults
  Object.keys(fieldValues).forEach(k => delete fieldValues[k])
  effect.fields.forEach(f => {
    fieldValues[f.key] = effect.defaults[f.key] || ''
  })
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function generateBarrageHTML() {
  const text = escapeHtml(fieldValues.text || effects[1].defaults.text)
  const color = fieldValues.color || effects[1].defaults.color
  const fontSize = fieldValues.fontSize || effects[1].defaults.fontSize
  const animId = 'barrage_' + Date.now()

  return `<section style="overflow:hidden;padding:8px 0;margin:8px 0;">
<style>
@keyframes ${animId} {
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}
</style>
<span style="display:inline-block;font-size:${fontSize};font-weight:600;color:${color};white-space:nowrap;animation:${animId} 8s linear infinite;">${text}</span>
</section>`
}

function generateRainbowHTML() {
  const text = escapeHtml(fieldValues.text || effects[0].defaults.text)
  const fontSize = fieldValues.fontSize || effects[0].defaults.fontSize
  const align = fieldValues.align || effects[0].defaults.align

  return `<section style="text-align:${align};padding:8px 0;margin:8px 0;">
<span style="font-size:${fontSize};font-weight:900;line-height:1.4;background:linear-gradient(90deg,#ff6b6b,#feca57,#48dbfb,#ff9ff3,#54a0ff,#ff6b6b);background-size:200% 100%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;display:inline-block;">${text}</span>
</section>`
}

function generateClickExpandHTML() {
  const title = escapeHtml(fieldValues.title || effects[2].defaults.title)
  const content = escapeHtml(fieldValues.content || effects[2].defaults.content).replace(/\n/g, '<br/>')
  const btnColor = fieldValues.btnColor || effects[2].defaults.btnColor
  const uniqId = 'exp_' + Date.now()

  return `<section style="text-align:center;padding:8px 0;margin:12px 0;">
<style>
#${uniqId}-box { max-height:0;overflow:hidden;transition:max-height 0.4s ease; }
#${uniqId}-btn:checked ~ #${uniqId}-box { max-height:500px; }
</style>
<input type="checkbox" id="${uniqId}-btn" style="display:none;">
<label for="${uniqId}-btn" style="display:inline-block;padding:8px 28px;background:${btnColor};color:#fff;border-radius:20px;font-size:13px;font-weight:600;cursor:pointer;text-decoration:none;">▼ ${title}</label>
<div id="${uniqId}-box" style="margin-top:10px;">
  <p style="font-size:14px;color:#555;line-height:1.8;text-align:left;margin:0;padding:12px 16px;background:#f8f9fa;border-radius:8px;">${content}</p>
</div>
</section>`
}

function generatePulseHTML() {
  const text = escapeHtml(fieldValues.text || effects[3].defaults.text)
  const color = fieldValues.color || effects[3].defaults.color
  const fontSize = fieldValues.fontSize || effects[3].defaults.fontSize
  const animId = 'pulse_' + Date.now()

  return `<section style="text-align:center;padding:8px 0;margin:8px 0;">
<style>
@keyframes ${animId} {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.08); opacity: 0.7; }
}
</style>
<span style="display:inline-block;font-size:${fontSize};color:${color};font-weight:700;line-height:1.6;animation:${animId} 2s ease-in-out infinite;">● ${text}</span>
</section>`
}

function generateTypewriterHTML() {
  const text = escapeHtml(fieldValues.text || effects[4].defaults.text)
  const fontSize = fieldValues.fontSize || effects[4].defaults.fontSize
  const color = fieldValues.color || effects[4].defaults.color
  const animId = 'tw_' + Date.now()
  const steps = text.length

  return `<section style="padding:8px 0;margin:8px 0;">
<style>
@keyframes ${animId}-cursor {
  0%, 50% { border-color: ${color}; }
  51%, 100% { border-color: transparent; }
}
@keyframes ${animId}-text {
  0% { width: 0; }
  100% { width: 100%; }
}
</style>
<span style="display:inline-block;font-size:${fontSize};color:${color};font-family:monospace;border-right:2px solid ${color};padding-right:2px;white-space:nowrap;overflow:hidden;animation:${animId}-text ${steps * 0.15 + 1}s steps(${steps}) 1 forwards, ${animId}-cursor 0.8s step-end infinite;">${text}</span>
</section>`
}

const generatedHTML = computed(() => {
  if (!selectedEffect.value) return ''
  switch (selectedEffect.value.id) {
    case 'barrage': return generateBarrageHTML()
    case 'rainbow-text': return generateRainbowHTML()
    case 'click-expand': return generateClickExpandHTML()
    case 'pulse': return generatePulseHTML()
    case 'typewriter': return generateTypewriterHTML()
    default: return ''
  }
})

const generatedPreview = computed(() => {
  return generatedHTML.value
})

function insertCode() {
  if (!generatedHTML.value) return
  emit('insert', generatedHTML.value)
  emit('close')
}
</script>

<style scoped>
/* Overlay */
.svgfx-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

/* Panel */
.svgfx-panel {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 24px 64px rgba(0,0,0,0.18);
  max-width: 720px;
  width: 100%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.svgfx-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.svgfx-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 8px;
}

.svgfx-icon {
  color: #667eea;
  font-size: 18px;
}

.btn-close {
  width: 28px;
  height: 28px;
  border: none;
  background: #f5f5f5;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.btn-close:hover { background: #e8e8e8; color: #555; }

.btn-close-sm {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  color: #aaa;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-close-sm:hover { background: #f0f0f0; color: #555; }

.svgfx-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

/* Grid */
.svgfx-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}

.svgfx-card {
  border: 2px solid #f0f0f0;
  border-radius: 10px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.15s;
  text-align: center;
}
.svgfx-card:hover {
  border-color: #667eea;
  box-shadow: 0 2px 12px rgba(102,126,234,0.12);
}
.svgfx-card.active {
  border-color: #667eea;
  background: #f8f9ff;
}

.svgfx-preview {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  overflow: hidden;
}

.svgfx-name {
  font-size: 13px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.svgfx-desc {
  font-size: 11px;
  color: #999;
  line-height: 1.4;
}

/* Editor */
.svgfx-editor {
  margin-top: 0;
}

.svgfx-editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0 16px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16px;
}

.svgfx-editor-title {
  font-size: 14px;
  font-weight: 600;
  color: #667eea;
}

.svgfx-fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.svgfx-field label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #888;
  margin-bottom: 4px;
  letter-spacing: 0.3px;
}

.svgfx-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 13px;
  color: #333;
  outline: none;
  transition: border-color 0.15s;
  box-sizing: border-box;
  font-family: inherit;
}
.svgfx-input:focus { border-color: #667eea; box-shadow: 0 0 0 3px rgba(102,126,234,0.08); }
.svgfx-textarea { resize: vertical; min-height: 60px; }

.svgfx-preview-box {
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  overflow: hidden;
}

.svgfx-preview-label {
  font-size: 11px;
  color: #bbb;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.svgfx-preview-content {
  min-height: 40px;
  display: flex;
  align-items: center;
  max-width: 100%;
  overflow: hidden;
}

.svgfx-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 0 16px;
  height: 34px;
  border: none;
  border-radius: 7px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.15s;
}

.btn-primary {
  background: #667eea;
  color: #fff;
}
.btn-primary:hover { background: #5a6fd6; }

.btn-secondary {
  background: #f0f0f0;
  color: #555;
}
.btn-secondary:hover { background: #e0e0e0; color: #333; }

/* Transitions */
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.2s;
}
.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-active {
  transition: all 0.25s ease;
}
.slide-fade-leave-active {
  transition: all 0.15s ease;
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
