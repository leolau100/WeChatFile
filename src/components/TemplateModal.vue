<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div class="tpl-overlay" @click.self="$emit('close')">
        <div class="tpl-panel">
          <!-- Header -->
          <div class="tpl-panel-header">
            <div class="tpl-panel-title">
              <span class="tpl-panel-icon">{{ type === 'header' ? '⬆' : '⬇' }}</span>
              {{ title }}
            </div>
            <div class="tpl-panel-actions">
              <button class="btn btn-primary" @click="handleAdd">+ 新建</button>
              <button class="btn-close" @click="$emit('close')">✕</button>
            </div>
          </div>

          <!-- Body -->
          <div class="tpl-panel-body">
            <!-- Template List -->
            <Transition name="slide-fade" mode="out-in">
              <div v-if="editingId === null" key="list" class="tpl-list-wrap">
                <div v-if="templates.length === 0" class="empty-state">
                  <div class="empty-icon">📄</div>
                  <p>暂无模版，点击「+ 新建」创建第一个</p>
                </div>
                <div v-else class="tpl-list">
                  <div
                    v-for="tpl in templates"
                    :key="tpl.id"
                    class="tpl-item"
                    :class="{ active: tpl.id === activeId }"
                  >
                    <div class="tpl-item-left">
                      <span class="tpl-active-dot" v-if="tpl.id === activeId">●</span>
                      <span class="tpl-item-name" :title="tpl.name">{{ tpl.name }}</span>
                      <span :class="['tpl-item-badge', isHtml(tpl.content) ? 'html' : 'md']">
                        {{ isHtml(tpl.content) ? 'HTML' : 'MD' }}
                      </span>
                    </div>
                    <div class="tpl-item-actions">
                      <button
                        class="btn-action"
                        :class="tpl.id === activeId ? 'btn-action-on' : 'btn-action-use'"
                        @click="handleToggleActive(tpl.id)"
                      >
                        {{ tpl.id === activeId ? '已启用' : '启用' }}
                      </button>
                      <button class="btn-action btn-action-edit" @click="handleEdit(tpl)">编辑</button>
                      <button class="btn-action btn-action-del" @click="handleDelete(tpl)">删除</button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Editor -->
              <div v-else key="editor" class="tpl-editor-wrap">
                <div class="tpl-editor-nav">
                  <button class="btn-back" @click="handleCancel">← 返回列表</button>
                  <span class="tpl-editor-title">{{ editingId === '__new__' ? '新建模版' : '编辑模版' }}</span>
                </div>
                <div class="tpl-editor-form">
                  <label>模版名称</label>
                  <input
                    type="text"
                    v-model="editName"
                    placeholder="例如：科技风封面、品牌关注卡片..."
                    @keydown.enter="handleSave"
                  />
                  <label>内容
                    <span class="label-hint">以 &lt; 开头视为 HTML 直接渲染，否则按 Markdown 解析</span>
                  </label>
                  <textarea
                    v-model="editContent"
                    placeholder="输入 HTML 或 Markdown 内容..."
                  ></textarea>
                </div>
                <div class="tpl-editor-footer">
                  <button class="btn btn-primary" @click="handleSave">保存模版</button>
                  <button class="btn btn-secondary" @click="handleCancel">取消</button>
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
import { ref } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  type: { type: String, required: true },
  templates: { type: Array, default: () => [] },
  activeId: { type: String, default: null }
})

const emit = defineEmits(['close', 'update', 'active-change'])

const editingId = ref(null)
const editName = ref('')
const editContent = ref('')

function isHtml(content) {
  return content.trimStart().startsWith('<')
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

function handleAdd() {
  editingId.value = '__new__'
  editName.value = ''
  editContent.value = ''
}

function handleEdit(tpl) {
  editingId.value = tpl.id
  editName.value = tpl.name
  editContent.value = tpl.content
}

function handleCancel() {
  editingId.value = null
  editName.value = ''
  editContent.value = ''
}

function handleSave() {
  const name = editName.value.trim()
  const content = editContent.value
  if (!name) { alert('请输入模版名称'); return }
  if (!content.trim()) { alert('内容不能为空'); return }

  let newTemplates = [...props.templates]
  let savedId = editingId.value

  if (editingId.value && editingId.value !== '__new__') {
    const idx = newTemplates.findIndex(t => t.id === editingId.value)
    if (idx >= 0) newTemplates[idx] = { ...newTemplates[idx], name, content }
  } else {
    const newId = genId()
    savedId = newId
    newTemplates.push({ id: newId, name, content })
  }

  emit('update', newTemplates)
  if (editingId.value === '__new__') emit('active-change', savedId)

  editingId.value = null
  editName.value = ''
  editContent.value = ''
}

function handleToggleActive(id) {
  emit('active-change', id === props.activeId ? null : id)
}

function handleDelete(tpl) {
  if (!confirm(`确定删除「${tpl.name}」？`)) return
  const newTemplates = props.templates.filter(t => t.id !== tpl.id)
  emit('update', newTemplates)
  if (props.activeId === tpl.id) emit('active-change', null)
}
</script>

<style scoped>
/* ===== Overlay ===== */
.tpl-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(3px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

/* ===== Panel ===== */
.tpl-panel {
  background: #fff;
  border-radius: 14px;
  width: 100%;
  max-width: 620px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.18), 0 4px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* ===== Panel Header ===== */
.tpl-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}
.tpl-panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
}
.tpl-panel-icon {
  width: 28px;
  height: 28px;
  background: #f0fdf6;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}
.tpl-panel-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.btn-close {
  width: 28px;
  height: 28px;
  border: none;
  background: #f5f5f5;
  border-radius: 7px;
  cursor: pointer;
  font-size: 13px;
  color: #888;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;
}
.btn-close:hover { background: #fee; color: #e53e3e; }

/* ===== Panel Body ===== */
.tpl-panel-body {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ===== Template List ===== */
.tpl-list-wrap { flex: 1; overflow-y: auto; }
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 10px;
  color: #aaa;
}
.empty-icon { font-size: 32px; }
.empty-state p { font-size: 13px; margin: 0; }

.tpl-list { display: flex; flex-direction: column; }
.tpl-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid #f5f5f5;
  transition: background 0.12s;
}
.tpl-item:last-child { border-bottom: none; }
.tpl-item:hover { background: #fafafa; }
.tpl-item.active { background: #f0fdf6; }

.tpl-item-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}
.tpl-active-dot {
  font-size: 8px;
  color: #07c160;
  flex-shrink: 0;
}
.tpl-item-name {
  font-size: 14px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tpl-item.active .tpl-item-name { color: #07c160; font-weight: 600; }

.tpl-item-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  flex-shrink: 0;
  font-weight: 600;
  letter-spacing: 0.3px;
}
.tpl-item-badge.md { background: #eff6ff; color: #3b82f6; }
.tpl-item-badge.html { background: #fff7ed; color: #f97316; }

.tpl-item-actions { display: flex; gap: 5px; flex-shrink: 0; }
.btn-action {
  padding: 4px 10px;
  font-size: 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  transition: opacity 0.15s;
}
.btn-action:hover { opacity: 0.85; }
.btn-action-use { background: #07c160; color: #fff; }
.btn-action-on { background: #e8e8e8; color: #666; }
.btn-action-edit { background: #eff6ff; color: #3b82f6; }
.btn-action-del { background: #fff0f0; color: #e53e3e; }

/* ===== Editor ===== */
.tpl-editor-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.tpl-editor-nav {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
  flex-shrink: 0;
}
.btn-back {
  background: none;
  border: none;
  font-size: 13px;
  color: #07c160;
  cursor: pointer;
  padding: 0;
  font-weight: 500;
}
.btn-back:hover { text-decoration: underline; }
.tpl-editor-title {
  font-size: 13px;
  color: #888;
}
.tpl-editor-form {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 0;
}
.tpl-editor-form label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #555;
  margin-bottom: 6px;
  margin-top: 14px;
}
.tpl-editor-form label:first-child { margin-top: 0; }
.label-hint {
  font-size: 11px;
  font-weight: 400;
  color: #aaa;
}
.tpl-editor-form input[type="text"] {
  width: 100%;
  border: 1.5px solid #e8e8e8;
  border-radius: 7px;
  padding: 8px 12px;
  font-size: 13px;
  color: #333;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s;
  background: #fff;
}
.tpl-editor-form input[type="text"]:focus { border-color: #07c160; }
.tpl-editor-form textarea {
  width: 100%;
  height: 200px;
  border: 1.5px solid #e8e8e8;
  border-radius: 7px;
  padding: 10px 12px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12.5px;
  color: #333;
  resize: vertical;
  outline: none;
  box-sizing: border-box;
  line-height: 1.6;
  transition: border-color 0.15s;
  background: #fff;
}
.tpl-editor-form textarea:focus { border-color: #07c160; }
.tpl-editor-footer {
  display: flex;
  gap: 8px;
  padding: 14px 20px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
  flex-shrink: 0;
}

/* ===== Buttons ===== */
.btn {
  display: inline-flex;
  align-items: center;
  height: 32px;
  padding: 0 16px;
  border: none;
  border-radius: 7px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.15s;
}
.btn-primary { background: #07c160; color: #fff; }
.btn-primary:hover { background: #06ad56; }
.btn-secondary { background: #f0f0f0; color: #555; border: 1px solid #e0e0e0; }
.btn-secondary:hover { background: #e8e8e8; }

/* ===== Transitions ===== */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-active .tpl-panel,
.modal-fade-leave-active .tpl-panel {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-from .tpl-panel,
.modal-fade-leave-to .tpl-panel {
  transform: translateY(12px);
  opacity: 0;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.slide-fade-enter-from { opacity: 0; transform: translateX(10px); }
.slide-fade-leave-to { opacity: 0; transform: translateX(-10px); }
</style>
