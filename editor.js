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
// 缓存主题 CSS 文本，避免每次重复 fetch
const themeCssCache = {};
async function getThemeCssText(theme) {
  if (themeCssCache[theme] !== undefined) return themeCssCache[theme];
  const text = await getThemeCss(theme);
  themeCssCache[theme] = text;
  return text;
}

/**
 * 两步渲染：
 * 1. 先把带 class 的 HTML 写入 iframe，让浏览器完整解析 CSS
 * 2. 解析主题 CSS 规则，把规则直接内联到 DOM，伪元素转真实节点
 * 3. 把内联后的 HTML 重新写入 iframe，预览即最终效果
 */
async function updatePreview() {
  const md = mdEditor.value;
  const bodyHtml = marked.parse(md);
  const themeCssText = await getThemeCssText(currentTheme);

  const headerHtml = renderTemplate(getActiveHeaderContent(), currentTheme);
  const footerHtml = renderTemplate(getActiveFooterContent(), currentTheme);

  // 第一步：写入带 class 的 HTML（用于 CSS 解析）
  const rawHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8">
<style>
  body{margin:0;padding:15px;overflow-x:hidden;word-wrap:break-word;word-break:break-word;box-sizing:border-box}
  ${themeCssText}
</style>
</head>
<body>
  <section style="margin:0;padding:0;width:100%;box-sizing:border-box;">
    <div data-tpl="header">${headerHtml}</div>
    <div data-tpl="body" class="theme-${currentTheme}">${bodyHtml}</div>
    <div data-tpl="footer">${footerHtml}</div>
  </section>
</body></html>`;

  const doc = previewIframe.contentDocument || previewIframe.contentWindow.document;
  doc.open(); doc.write(rawHtml); doc.close();

  // 第二步：解析规则并内联，然后重写 iframe
  await new Promise(r => setTimeout(r, 30)); // 等 CSS 解析完成
  const inlined = inlineThemeToSection(doc, themeCssText);

  const finalHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8">
<style>
  ::-webkit-scrollbar{width:5px}
  ::-webkit-scrollbar-thumb{background:#ddd;border-radius:3px}
  body{margin:0;padding:15px;overflow-x:hidden;word-wrap:break-word;word-break:break-word;box-sizing:border-box}
</style>
</head>
<body>${inlined}</body></html>`;

  doc.open(); doc.write(finalHtml); doc.close();

  // 高度自适应
  setTimeout(() => {
    try {
      const h = previewIframe.contentDocument.body.scrollHeight;
      previewIframe.style.height = Math.max(h + 20, 600) + 'px';
    } catch(e) {}
  }, 60);

  wordCount.textContent = countWords(md) + ' 字';
  saveToStorage(STORAGE_KEY_CONTENT, md);
}

/**
 * 从已渲染的 doc 中提取 section，把主题规则内联进去，返回内联后的 outerHTML。
 * - data-tpl="body"：正文，始终应用主题内联
 * - data-tpl="header/footer"：
 *     - 内部有 .theme-xxx（Markdown 渲染的）→ 对该子区域应用主题内联
 *     - 纯 HTML 模版 → 原样保留，不修改任何 style
 */
function inlineThemeToSection(doc, themeCssText) {
  const section = doc.body.querySelector('section');
  if (!section) return doc.body.innerHTML;

  const rules = parseThemeCssRules(themeCssText);
  const clone = section.cloneNode(true);
  doc.body.appendChild(clone);

  // 对指定容器应用主题内联并清理 class
  function inlineContainer(container) {
    applyThemeRulesToDom(container, rules, doc);
    container.querySelectorAll('[class]').forEach(el => el.removeAttribute('class'));
    container.removeAttribute('class');
  }

  // 正文区域：始终内联
  const bodyDiv = clone.querySelector('[data-tpl="body"]');
  if (bodyDiv) {
    inlineContainer(bodyDiv);
    bodyDiv.removeAttribute('data-tpl');
  }

  // header / footer 区域：只有 Markdown 渲染的才内联
  ['header', 'footer'].forEach(tplType => {
    const tplDiv = clone.querySelector(`[data-tpl="${tplType}"]`);
    if (!tplDiv) return;
    // 检查是否包含主题 class（Markdown 渲染时会包裹 <div class="theme-xxx">）
    const themeChild = tplDiv.querySelector('[class^="theme-"]');
    if (themeChild) {
      // Markdown 模版：对整个 tplDiv 内联主题样式
      inlineContainer(tplDiv);
    }
    // HTML 模版：什么都不做，保留原始 style
    tplDiv.removeAttribute('data-tpl');
  });

  clone.removeAttribute('class');
  clone.style.setProperty('width', '100%');
  clone.style.setProperty('box-sizing', 'border-box');

  const result = clone.outerHTML;
  doc.body.removeChild(clone);
  return result;
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

  let savedId = editingTplId;

  if (type === 'header') {
    const list = getHeaderTpls();
    if (editingTplId) {
      const idx = list.findIndex(t => t.id === editingTplId);
      if (idx >= 0) list[idx] = { ...list[idx], name, content };
    } else {
      const newId = genId();
      savedId = newId;
      list.push({ id: newId, name, content });
    }
    saveHeaderTpls(list);
    // 新建时自动激活；编辑时如果是当前激活的模版，内容已更新无需改 id
    if (!editingTplId) {
      activeHeaderId = savedId;
      saveToStorage(STORAGE_KEY_ACTIVE_HEADER, savedId);
    }
  } else {
    const list = getFooterTpls();
    if (editingTplId) {
      const idx = list.findIndex(t => t.id === editingTplId);
      if (idx >= 0) list[idx] = { ...list[idx], name, content };
    } else {
      const newId = genId();
      savedId = newId;
      list.push({ id: newId, name, content });
    }
    saveFooterTpls(list);
    // 新建时自动激活
    if (!editingTplId) {
      activeFooterId = savedId;
      saveToStorage(STORAGE_KEY_ACTIVE_FOOTER, savedId);
    }
  }

  closeTplEditor(type);
  renderTplList(type);
  updatePreview();
  showToast('模版已保存' + (savedId && (type === 'header' ? activeHeaderId : activeFooterId) === savedId ? '并已激活' : ''));
}

// ===== CSS Rule Parser =====
/**
 * 解析主题 CSS 文本，返回规则映射：
 * {
 *   element: { prop: value, ... },           // .theme-xxx p
 *   'element::before': { content, ... },     // .theme-xxx p::before
 *   'element::after': { content, ... },
 *   'element .child': { ... },               // .theme-xxx h2 .content
 *   '__root__': { ... },                     // .theme-xxx 根容器
 * }
 */
function parseThemeCssRules(cssText) {
  const rules = {};
  // 去掉注释
  const cleaned = cssText.replace(/\/\*[\s\S]*?\*\//g, '');
  // 匹配每条规则
  const ruleRe = /([^{]+)\{([^}]*)\}/g;
  let m;
  while ((m = ruleRe.exec(cleaned)) !== null) {
    const selector = m[1].trim();
    const body = m[2].trim();
    if (!body) continue;

    // 解析属性
    const props = {};
    body.split(';').forEach(decl => {
      const idx = decl.indexOf(':');
      if (idx < 0) return;
      const prop = decl.slice(0, idx).trim();
      const val  = decl.slice(idx + 1).trim();
      if (prop && val) props[prop] = val;
    });
    if (Object.keys(props).length === 0) continue;

    // 提取选择器中 .theme-xxx 后面的部分
    // 支持：.theme-xxx { }  .theme-xxx p { }  .theme-xxx h2::before { }  .theme-xxx h2 .content { }
    const themeRe = /\.theme-[\w-]+\s*(.*)/;
    const sm = selector.match(themeRe);
    if (!sm) continue;

    const rest = sm[1].trim(); // e.g. "p", "h2::before", "h2 .content", ""
    const key = rest === '' ? '__root__' : rest;
    rules[key] = Object.assign(rules[key] || {}, props);
  }
  return rules;
}

// ===== Inline Styles from Theme Rules =====
/**
 * 把解析好的主题规则直接内联到 DOM 节点上。
 * 伪元素 ::before / ::after 转成真实 <span> 节点插入。
 * 子选择器（如 h2 .content）保留为 class，由调用方处理。
 */
function applyThemeRulesToDom(container, rules, doc) {
  // 标签名 → 规则 key 的映射（只处理普通元素规则）
  const TAG_KEYS = ['p','h1','h2','h3','h4','h5','h6',
    'blockquote','code','pre','strong','em','a',
    'ul','ol','li','hr','table','th','td','img','del','section','div','span'];

  // 应用根容器样式
  if (rules['__root__']) {
    applyProps(container, rules['__root__']);
  }

  TAG_KEYS.forEach(tag => {
    const elRules = rules[tag];
    const beforeRules = rules[`${tag}::before`];
    const afterRules  = rules[`${tag}::after`];

    container.querySelectorAll(tag).forEach(el => {
      // 跳过 pre 内部的 code（已有 pre code 规则处理）
      if (tag === 'code' && el.closest('pre')) {
        const preCodeRules = rules['pre code'];
        if (preCodeRules) applyProps(el, preCodeRules);
        return;
      }

      if (elRules) applyProps(el, elRules);

      // 处理 ::before 伪元素 → 插入真实 <span>
      if (beforeRules && beforeRules['content']) {
        const span = makePseudoSpan(beforeRules, doc);
        if (span) el.insertBefore(span, el.firstChild);
      }

      // 处理 ::after 伪元素 → 追加真实 <span>
      if (afterRules && afterRules['content']) {
        const span = makePseudoSpan(afterRules, doc);
        if (span) el.appendChild(span);
      }
    });
  });

  // 处理子选择器规则，如 "h2 .content"、"h1::before" 已处理，
  // 这里处理 "h2 .content" 这类 .content 子元素
  Object.keys(rules).forEach(key => {
    if (key === '__root__' || !key.includes(' ')) return;
    if (key.includes('::')) return; // 伪元素已处理
    // key 形如 "h2 .content"
    try {
      container.querySelectorAll(key).forEach(el => {
        applyProps(el, rules[key]);
      });
    } catch(e) {}
  });
}

function applyProps(el, props) {
  Object.entries(props).forEach(([prop, val]) => {
    // 跳过 position/content/z-index 等不适合直接内联的属性
    if (['position', 'z-index', 'content', 'counter-reset', 'counter-increment',
         'transition', 'animation', 'clip-path', 'transform'].includes(prop)) return;
    try { el.style.setProperty(prop, val); } catch(e) {}
  });
}

function makePseudoSpan(pseudoRules, doc) {
  let text = pseudoRules['content'] || '';
  // CSS content 值：去掉引号，处理转义
  text = text.replace(/^['"]|['"]$/g, '');
  // 空字符串伪元素（纯装饰用 background/border）→ 用空 span 承载样式
  const span = doc.createElement('span');
  span.setAttribute('aria-hidden', 'true');
  if (text && text !== 'none' && text !== '') {
    // 处理 Unicode 转义 \201C → "
    text = text.replace(/\\([0-9a-fA-F]{4,6})/g, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16))
    );
    span.textContent = text;
  }
  // 应用伪元素的样式（排除 content 本身）
  const styleProps = Object.assign({}, pseudoRules);
  delete styleProps['content'];
  // 伪元素通常是 inline-block 或 block
  if (!styleProps['display']) styleProps['display'] = 'inline-block';
  applyProps(span, styleProps);
  // 纯装饰性空伪元素（无文字、无背景）不插入
  const hasVisual = text || styleProps['background'] || styleProps['background-color']
    || styleProps['border'] || styleProps['width'];
  return hasVisual ? span : null;
}

// ===== Build Inlined HTML for Copy =====
/**
 * 预览已经是内联样式了，直接从 iframe body 取出即可。
 */
async function buildInlinedHtml() {
  const doc = previewIframe.contentDocument || previewIframe.contentWindow.document;
  const section = doc.body.querySelector('section');
  return section ? section.outerHTML : doc.body.innerHTML;
}

copyBtn.addEventListener('click', async () => {
  await updatePreview();
  // 等 iframe 渲染稳定后再提取
  await new Promise(r => setTimeout(r, 80));
  const html = await buildInlinedHtml();
  try {
    const blob = new Blob([html], { type: 'text/html' });
    await navigator.clipboard.write([new ClipboardItem({
      'text/html': blob,
      'text/plain': new Blob([html], { type: 'text/plain' })
    })]);
    showToast('复制成功！可直接粘贴到微信公众号编辑器');
  } catch(e) {
    try { await navigator.clipboard.writeText(html); showToast('复制成功！(纯文本模式)'); }
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
closeHeaderTplBtn.addEventListener('click', () => {
  headerTplModal.classList.remove('show');
  updatePreview();
});
addHeaderTplBtn.addEventListener('click', () => openTplEditor('header'));
saveHeaderTplBtn.addEventListener('click', () => saveTpl('header'));
cancelHeaderTplEditBtn.addEventListener('click', () => closeTplEditor('header'));

// ===== Footer template modal events =====
footerTplBtn.addEventListener('click', () => {
  renderTplList('footer');
  closeTplEditor('footer');
  footerTplModal.classList.add('show');
});
closeFooterTplBtn.addEventListener('click', () => {
  footerTplModal.classList.remove('show');
  updatePreview();
});
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
