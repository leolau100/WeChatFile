// ===== Storage Keys =====
const STORAGE_KEY_CONTENT = 'wechat_md_content';
const STORAGE_KEY_THEME   = 'wechat_md_theme';
const STORAGE_KEY_HEADER_TPLS = 'wechat_md_header_tpls';
const STORAGE_KEY_FOOTER_TPLS = 'wechat_md_footer_tpls';
const STORAGE_KEY_ACTIVE_HEADER = 'wechat_md_active_header';
const STORAGE_KEY_ACTIVE_FOOTER = 'wechat_md_active_footer';

// ===== DOM refs =====
const mdEditor       = document.getElementById('mdEditor');
const previewIframe  = document.getElementById('previewIframe');
const wordCount      = document.getElementById('wordCount');
const copyBtn        = document.getElementById('copyBtn');
const themeBtn       = document.getElementById('themeBtn');
const themeModal     = document.getElementById('themeModal');
const cancelThemeBtn = document.getElementById('cancelThemeBtn');
const toast          = document.getElementById('toast');
const resetBtn       = document.getElementById('resetBtn');

// Header template modal
const headerTplBtn          = document.getElementById('headerTplBtn');
const headerTplModal        = document.getElementById('headerTplModal');
const closeHeaderTplBtn     = document.getElementById('closeHeaderTplBtn');
const addHeaderTplBtn       = document.getElementById('addHeaderTplBtn');
const headerTplList         = document.getElementById('headerTplList');
const headerTplEditor       = document.getElementById('headerTplEditor');
const headerTplName         = document.getElementById('headerTplName');
const headerTplContent      = document.getElementById('headerTplContent');
const saveHeaderTplBtn      = document.getElementById('saveHeaderTplBtn');
const cancelHeaderTplEditBtn = document.getElementById('cancelHeaderTplEditBtn');

// Footer template modal
const footerTplBtn          = document.getElementById('footerTplBtn');
const footerTplModal        = document.getElementById('footerTplModal');
const closeFooterTplBtn     = document.getElementById('closeFooterTplBtn');
const addFooterTplBtn       = document.getElementById('addFooterTplBtn');
const footerTplList         = document.getElementById('footerTplList');
const footerTplEditor       = document.getElementById('footerTplEditor');
const footerTplName         = document.getElementById('footerTplName');
const footerTplContent      = document.getElementById('footerTplContent');
const saveFooterTplBtn      = document.getElementById('saveFooterTplBtn');
const cancelFooterTplEditBtn = document.getElementById('cancelFooterTplEditBtn');

// ===== State =====
let currentTheme = 'blue';
let activeHeaderId = null;  // null = no header
let activeFooterId = null;  // null = no footer
let editingTplId   = null;  // id being edited, null = new
let editingTplType = null;  // 'header' | 'footer'

// ===== Helpers =====
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

function saveToStorage(key, value) {
  try { localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value)); }
  catch(e) { console.warn('Storage save failed:', e); }
}

function loadFromStorage(key, defaultVal = '') {
  try { return localStorage.getItem(key) ?? defaultVal; }
  catch(e) { return defaultVal; }
}

function loadJsonFromStorage(key, defaultVal = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch(e) { return defaultVal; }
}

function countWords(text) {
  return text ? text.replace(/\s/g, '').length : 0;
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/**
 * 判断内容是 HTML 还是 Markdown。
 * 规则：去掉首尾空白后，以 < 开头则视为 HTML。
 */
function isHtml(content) {
  return content.trimStart().startsWith('<');
}

/**
 * 将模版内容渲染为 HTML 字符串。
 * - HTML 内容：直接返回
 * - Markdown 内容：用 marked 解析，包裹在主题 div 中
 */
function renderTemplate(content, theme) {
  if (!content || !content.trim()) return '';
  if (isHtml(content)) {
    return content;
  }
  // Markdown → 解析后包裹主题 class
  const parsed = marked.parse(content);
  return `<div class="theme-${theme}">${parsed}</div>`;
}

// ===== Template CRUD =====
function getHeaderTpls() { return loadJsonFromStorage(STORAGE_KEY_HEADER_TPLS, []); }
function getFooterTpls() { return loadJsonFromStorage(STORAGE_KEY_FOOTER_TPLS, []); }
function saveHeaderTpls(list) { saveToStorage(STORAGE_KEY_HEADER_TPLS, list); }
function saveFooterTpls(list) { saveToStorage(STORAGE_KEY_FOOTER_TPLS, list); }

function getActiveHeaderContent() {
  if (!activeHeaderId) return '';
  const tpl = getHeaderTpls().find(t => t.id === activeHeaderId);
  return tpl ? tpl.content : '';
}

function getActiveFooterContent() {
  if (!activeFooterId) return '';
  const tpl = getFooterTpls().find(t => t.id === activeFooterId);
  return tpl ? tpl.content : '';
}

// ===== Theme CSS =====
const themeFileMap = {
  'blue': 'themes/blue.css', 'orange': 'themes/orange.css',
  'green': 'themes/green.css', 'cute-yellow': 'themes/cute-yellow.css',
  'tech-purple': 'themes/tech-purple.css', 'warm-orange': 'themes/warm-orange.css',
  'elegant-purple': 'themes/elegant-purple.css', 'geek-tech': 'themes/geek-tech.css',
  'pop-art': 'themes/pop-art.css', 'minimal-blue': 'themes/minimal-blue.css',
  'bw-minimal': 'themes/bw-minimal.css', 'classic-yellow': 'themes/classic-yellow.css',
  'neon': 'themes/neon.css', 'ink-wash': 'themes/ink-wash.css',
};

async function getThemeCss(theme) {
  const file = themeFileMap[theme];
  if (!file) return '';
  try {
    const url = chrome.runtime.getURL(file);
    const resp = await fetch(url);
    if (resp.ok) return await resp.text();
  } catch(e) {}
  return '';
}

// ===== Preview =====
async function updatePreview() {
  const md = mdEditor.value;
  const bodyHtml = marked.parse(md);
  const themeCss = await getThemeCss(currentTheme);

  const headerHtml = renderTemplate(getActiveHeaderContent(), currentTheme);
  const footerHtml = renderTemplate(getActiveFooterContent(), currentTheme);

  const iframeHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <style>
    ::-webkit-scrollbar{width:6px;height:6px}
    ::-webkit-scrollbar-track{background:#f5f5f5}
    ::-webkit-scrollbar-thumb{background:#ccc;border-radius:3px}
    body{margin:0;padding:15px;overflow-x:hidden;word-wrap:break-word;word-break:break-word;box-sizing:border-box}
    p{margin:1em 0;line-height:1.8;color:#333;font-size:16px}
    h1,h2,h3,h4,h5,h6{margin:1.2em 0 0.6em;font-weight:600;line-height:1.4}
    blockquote{border-left:4px solid #ddd;padding:8px 16px;margin:1em 0;color:#666;background:#f9f9f9}
    code{background:rgba(135,131,120,.15);padding:2px 6px;border-radius:3px;font-family:Consolas,Monaco,monospace;font-size:14px}
    pre{background:#1e1e1e;padding:16px;border-radius:6px;overflow-x:auto;margin:1.5em 0}
    pre code{background:none;padding:0;color:#d4d4d4}
    table{border-collapse:collapse;width:100%;margin:1.5em 0}
    th,td{border:1px solid #e5e5e5;padding:8px 12px;text-align:left}
    th{background:#f5f5f5;font-weight:600}
    hr{border:none;border-top:1px solid #e5e5e5;margin:2em 0}
    ul,ol{margin:1em 0;padding-left:1.8em}
    li{margin:.3em 0;line-height:1.7}
    img{max-width:100%;height:auto}
    a{color:#576b95;text-decoration:none}
    strong{font-weight:700}
    del{text-decoration:line-through;color:#999}
    ${themeCss}
  </style>
</head>
<body>
  <section style="margin:0;padding:0;">
    ${headerHtml}
    <div class="theme-${currentTheme}">${bodyHtml}</div>
    ${footerHtml}
  </section>
</body>
</html>`;

  const doc = previewIframe.contentDocument || previewIframe.contentWindow.document;
  doc.open(); doc.write(iframeHTML); doc.close();

  wordCount.textContent = '字数: ' + countWords(md);
  saveToStorage(STORAGE_KEY_CONTENT, md);
}

// ===== Render template list =====
function renderTplList(type) {
  const tpls = type === 'header' ? getHeaderTpls() : getFooterTpls();
  const listEl = type === 'header' ? headerTplList : footerTplList;
  const activeId = type === 'header' ? activeHeaderId : activeFooterId;

  listEl.innerHTML = '';

  if (tpls.length === 0) {
    listEl.innerHTML = '<div style="text-align:center;color:#888;padding:20px 16px;">暂无模版，点击「+ 新建」创建</div>';
    return;
  }

  tpls.forEach(tpl => {
    const typeLabel = isHtml(tpl.content) ? 'html' : 'md';
    const isActive = tpl.id === activeId;

    const item = document.createElement('div');
    item.className = 'tpl-item' + (isActive ? ' active' : '');
    item.innerHTML = `
      <span class="tpl-item-name" title="${tpl.name}">${tpl.name}</span>
      <span class="tpl-item-type ${typeLabel}">${typeLabel.toUpperCase()}</span>
      <div class="tpl-item-actions">
        <button class="btn-use" style="background:${isActive ? '#555' : '#07c160'};color:#fff;border-radius:3px;border:none;padding:3px 8px;font-size:12px;cursor:pointer;">
          ${isActive ? '已启用' : '启用'}
        </button>
        <button class="btn-edit" style="background:#404040;color:#fff;border-radius:3px;border:none;padding:3px 8px;font-size:12px;cursor:pointer;">编辑</button>
        <button class="btn-del" style="background:#dc3545;color:#fff;border-radius:3px;border:none;padding:3px 8px;font-size:12px;cursor:pointer;">删除</button>
      </div>`;

    // 启用 / 取消启用
    item.querySelector('.btn-use').addEventListener('click', () => {
      if (type === 'header') {
        activeHeaderId = isActive ? null : tpl.id;
        saveToStorage(STORAGE_KEY_ACTIVE_HEADER, activeHeaderId || '');
      } else {
        activeFooterId = isActive ? null : tpl.id;
        saveToStorage(STORAGE_KEY_ACTIVE_FOOTER, activeFooterId || '');
      }
      renderTplList(type);
      updatePreview();
      showToast(isActive ? '已取消启用' : `已启用「${tpl.name}」`);
    });

    // 编辑
    item.querySelector('.btn-edit').addEventListener('click', () => {
      openTplEditor(type, tpl);
    });

    // 删除
    item.querySelector('.btn-del').addEventListener('click', () => {
      if (!confirm(`确定删除「${tpl.name}」？`)) return;
      if (type === 'header') {
        const list = getHeaderTpls().filter(t => t.id !== tpl.id);
        saveHeaderTpls(list);
        if (activeHeaderId === tpl.id) { activeHeaderId = null; saveToStorage(STORAGE_KEY_ACTIVE_HEADER, ''); }
      } else {
        const list = getFooterTpls().filter(t => t.id !== tpl.id);
        saveFooterTpls(list);
        if (activeFooterId === tpl.id) { activeFooterId = null; saveToStorage(STORAGE_KEY_ACTIVE_FOOTER, ''); }
      }
      renderTplList(type);
      updatePreview();
      showToast('已删除');
    });

    listEl.appendChild(item);
  });
}

// ===== Template editor open/close =====
function openTplEditor(type, tpl = null) {
  editingTplType = type;
  editingTplId   = tpl ? tpl.id : null;

  if (type === 'header') {
    headerTplName.value    = tpl ? tpl.name : '';
    headerTplContent.value = tpl ? tpl.content : '';
    headerTplEditor.style.display = 'block';
  } else {
    footerTplName.value    = tpl ? tpl.name : '';
    footerTplContent.value = tpl ? tpl.content : '';
    footerTplEditor.style.display = 'block';
  }
}

function closeTplEditor(type) {
  if (type === 'header') headerTplEditor.style.display = 'none';
  else footerTplEditor.style.display = 'none';
  editingTplId = null; editingTplType = null;
}

function saveTpl(type) {
  const nameEl    = type === 'header' ? headerTplName    : footerTplName;
  const contentEl = type === 'header' ? headerTplContent : footerTplContent;
  const name    = nameEl.value.trim();
  const content = contentEl.value;

  if (!name) { showToast('请输入模版名称'); return; }
  if (!content.trim()) { showToast('内容不能为空'); return; }

  if (type === 'header') {
    const list = getHeaderTpls();
    if (editingTplId) {
      const idx = list.findIndex(t => t.id === editingTplId);
      if (idx >= 0) list[idx] = { ...list[idx], name, content };
    } else {
      list.push({ id: genId(), name, content });
    }
    saveHeaderTpls(list);
  } else {
    const list = getFooterTpls();
    if (editingTplId) {
      const idx = list.findIndex(t => t.id === editingTplId);
      if (idx >= 0) list[idx] = { ...list[idx], name, content };
    } else {
      list.push({ id: genId(), name, content });
    }
    saveFooterTpls(list);
  }

  closeTplEditor(type);
  renderTplList(type);
  updatePreview();
  showToast('模版已保存');
}

// ===== Copy with inline styles =====
function extractInlinedHtml() {
  const doc = previewIframe.contentDocument || previewIframe.contentWindow.document;
  const section = doc.body.querySelector('section');
  if (!section) return doc.body.innerHTML;

  const TAGS = ['p','h1','h2','h3','h4','h5','h6','blockquote','pre','code',
                 'strong','em','a','ul','ol','li','table','thead','tbody','tr',
                 'th','td','hr','img','del','section','div','span','figure',
                 'figcaption','br'];
  const PROPS = [
    'font-family','font-size','font-weight','font-style',
    'color','background-color','background-image','background-size',
    'line-height','letter-spacing','text-align','text-decoration',
    'margin','margin-top','margin-right','margin-bottom','margin-left',
    'padding','padding-top','padding-right','padding-bottom','padding-left',
    'border','border-top','border-right','border-bottom','border-left',
    'border-radius','border-collapse',
    'width','max-width','height',
    'display','vertical-align','overflow-x',
    'list-style-type','list-style',
    'position','z-index',
    'white-space','word-break','word-wrap',
    'box-shadow','opacity',
  ];

  const clone = section.cloneNode(true);
  doc.body.appendChild(clone);

  function inlineNode(original, cloned) {
    if (original.nodeType !== 1) return;
    const tag = original.tagName.toLowerCase();
    if (TAGS.includes(tag)) {
      const computed = doc.defaultView.getComputedStyle(original);
      const styles = [];
      for (const prop of PROPS) {
        const val = computed.getPropertyValue(prop);
        if (val && val !== 'initial' && val !== 'normal' && val !== 'none' && val !== '') {
          if (prop === 'background-color' && val === 'rgba(0, 0, 0, 0)') continue;
          if (prop === 'background-image' && val === 'none') continue;
          styles.push(`${prop}:${val}`);
        }
      }
      const existing = cloned.getAttribute('style') || '';
      cloned.setAttribute('style', existing ? existing + ';' + styles.join(';') : styles.join(';'));
    }
    const origChildren = original.children;
    const clonedChildren = cloned.children;
    for (let i = 0; i < origChildren.length; i++) {
      inlineNode(origChildren[i], clonedChildren[i]);
    }
  }

  inlineNode(section, clone);
  clone.querySelectorAll('[class]').forEach(el => el.removeAttribute('class'));
  const result = clone.outerHTML;
  doc.body.removeChild(clone);
  return result;
}

copyBtn.addEventListener('click', async () => {
  await updatePreview();
  const inlinedHtml = extractInlinedHtml();
  try {
    const blob = new Blob([inlinedHtml], { type: 'text/html' });
    await navigator.clipboard.write([new ClipboardItem({
      'text/html': blob,
      'text/plain': new Blob([inlinedHtml], { type: 'text/plain' })
    })]);
    showToast('复制成功！可直接粘贴到微信公众号编辑器');
  } catch(e) {
    try { await navigator.clipboard.writeText(inlinedHtml); showToast('复制成功！(纯文本模式)'); }
    catch(e2) { showToast('复制失败，请手动复制'); }
  }
});

// ===== Theme =====
function setTheme(theme) {
  currentTheme = theme;
  saveToStorage(STORAGE_KEY_THEME, theme);
  document.querySelectorAll('.theme-card').forEach(card => {
    card.classList.toggle('active', card.getAttribute('data-theme') === theme);
  });
  updatePreview();
}

themeBtn.addEventListener('click', () => themeModal.classList.add('show'));
cancelThemeBtn.addEventListener('click', () => themeModal.classList.remove('show'));
document.querySelectorAll('.theme-card').forEach(card => {
  card.addEventListener('click', () => {
    setTheme(card.getAttribute('data-theme'));
    themeModal.classList.remove('show');
    showToast('主题已切换：' + card.querySelector('.theme-name').textContent);
  });
});

// ===== Header template modal events =====
headerTplBtn.addEventListener('click', () => {
  renderTplList('header');
  closeTplEditor('header');
  headerTplModal.classList.add('show');
});
closeHeaderTplBtn.addEventListener('click', () => headerTplModal.classList.remove('show'));
addHeaderTplBtn.addEventListener('click', () => openTplEditor('header'));
saveHeaderTplBtn.addEventListener('click', () => saveTpl('header'));
cancelHeaderTplEditBtn.addEventListener('click', () => closeTplEditor('header'));

// ===== Footer template modal events =====
footerTplBtn.addEventListener('click', () => {
  renderTplList('footer');
  closeTplEditor('footer');
  footerTplModal.classList.add('show');
});
closeFooterTplBtn.addEventListener('click', () => footerTplModal.classList.remove('show'));
addFooterTplBtn.addEventListener('click', () => openTplEditor('footer'));
saveFooterTplBtn.addEventListener('click', () => saveTpl('footer'));
cancelFooterTplEditBtn.addEventListener('click', () => closeTplEditor('footer'));

// ===== Reset =====
resetBtn.addEventListener('click', async () => {
  if (confirm('确定要重置所有缓存吗？这将清除所有保存的内容、模版和主题设置。')) {
    localStorage.clear();
    await init();
    showToast('缓存已重置！');
  }
});

// ===== Editor input =====
mdEditor.addEventListener('input', updatePreview);

// ===== Default templates =====
const DEFAULT_FOOTER_HTML = `<section style="margin:0;padding:0;">
<p style="margin:30px 0 20px 0;border-top:1px solid #eeeeee;font-size:1px;line-height:1px;">&nbsp;</p>
<p style="margin:0 0 12px 0;padding:6px 10px;border-left:4px solid #f7b500;font-size:14px;font-weight:bold;color:#333333;line-height:1.5;">关于作者</p>
<p style="margin:0 0 0 12px;font-size:13px;color:#555555;line-height:1.6;text-align:justify;">常驻硅谷与前沿技术一线的科技评论员，前硬核科技媒体主笔。深耕 AI 行业、智能硬件与数字化转型领域，致力于用剥离滤镜的客观视角，拆解科技演进背后的真实商业逻辑与技术真相。</p>
<p style="margin:25px 0 12px 0;padding:6px 10px;border-left:4px solid #f7b500;font-size:14px;font-weight:bold;color:#333333;line-height:1.5;">关于本号</p>
<p style="margin:0 0 0 12px;font-size:13px;color:#555555;line-height:1.6;text-align:justify;">不跟风，不造神。我们是一家专注科技趋势深度复盘、硬核产业拆解的原创内容基地。每周为您奉上最硬核的行业内幕观察与通俗易懂的技术底层剖析。</p>
<table style="width:100%;border:1px solid #eeeeee;background-color:#fafafa;border-radius:12px;margin:25px 0 0 0;border-collapse:separate;">
  <tr>
    <td style="padding:18px;vertical-align:top;">
      <p style="margin:0 0 6px 0;font-size:16px;color:#222222;font-weight:600;line-height:1.4;">欢迎关注 "公众"</p>
      <p style="margin:0 0 4px 0;font-size:12px;color:#666666;line-height:1.4;">在这里，换个姿势看懂科技未来。</p>
      <p style="margin:0;font-size:11px;color:#999999;line-height:1.4;">💡 长按右侧二维码，识别并关注本号</p>
    </td>
    <td style="width:92px;padding:18px;vertical-align:middle;">
      <div style="width:84px;height:84px;background-color:#ffffff;border:1px solid #e5e5e5;border-radius:8px;padding:4px;">
        <img src="" alt="二维码" style="width:100%;height:100%;object-fit:contain;display:block;" />
      </div>
    </td>
  </tr>
</table>
</section>`;

async function loadFooterFileContent() {
  try {
    const url = chrome.runtime.getURL('footer/footeer1.md');
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const text = await resp.text();
    // 去掉 front matter
    const match = text.match(/^---[\s\S]*?---\s*\n([\s\S]*)$/);
    return match ? match[1].trim() : text.trim();
  } catch(e) { return null; }
}

// ===== Init =====
async function init() {
  // Theme
  const savedTheme = loadFromStorage(STORAGE_KEY_THEME);
  currentTheme = savedTheme || 'blue';

  // Active template ids
  const savedActiveHeader = loadFromStorage(STORAGE_KEY_ACTIVE_HEADER);
  const savedActiveFooter = loadFromStorage(STORAGE_KEY_ACTIVE_FOOTER);
  activeHeaderId = savedActiveHeader || null;
  activeFooterId = savedActiveFooter || null;

  // Seed default footer template if none exist
  const footerTpls = getFooterTpls();
  if (footerTpls.length === 0) {
    const fileContent = await loadFooterFileContent();
    const defaultId = genId();
    const defaultTpl = {
      id: defaultId,
      name: '关于作者、关于本号',
      content: fileContent || DEFAULT_FOOTER_HTML
    };
    saveFooterTpls([defaultTpl]);
    // Auto-activate the default footer
    if (!activeFooterId) {
      activeFooterId = defaultId;
      saveToStorage(STORAGE_KEY_ACTIVE_FOOTER, defaultId);
    }
  }

  // Content
  const savedContent = loadFromStorage(STORAGE_KEY_CONTENT);
  mdEditor.value = savedContent || '# 欢迎使用微信文章编辑器\n\n在这里输入你的 Markdown 内容...\n\n## 支持的语法\n\n- **粗体** 和 *斜体*\n- [链接文字](https://example.com)\n- > 引用块\n- `inline code`\n\n```javascript\nfunction hello() {\n  console.log("Hello World");\n}\n```\n\n| 表格 | 示例 |\n|------|------|\n| 第一行 | 内容 |\n';

  setTheme(currentTheme);
  updatePreview();
}

init();
