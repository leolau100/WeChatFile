const mdEditor = document.getElementById('mdEditor');
const previewIframe = document.getElementById('previewIframe');
const wordCount = document.getElementById('wordCount');
const copyBtn = document.getElementById('copyBtn');
const headerBtn = document.getElementById('headerBtn');
const footerBtn = document.getElementById('footerBtn');
const headerFile = document.getElementById('headerFile');
const footerFile = document.getElementById('footerFile');
const loadHeaderBtn = document.getElementById('loadHeaderBtn');
const loadFooterBtn = document.getElementById('loadFooterBtn');
const themeBtn = document.getElementById('themeBtn');
const themeModal = document.getElementById('themeModal');
const cancelThemeBtn = document.getElementById('cancelThemeBtn');
const toast = document.getElementById('toast');
const headerModal = document.getElementById('headerModal');
const footerModal = document.getElementById('footerModal');
const headerEditor = document.getElementById('headerEditor');
const footerEditor = document.getElementById('footerEditor');
const saveHeaderBtn = document.getElementById('saveHeaderBtn');
const saveFooterBtn = document.getElementById('saveFooterBtn');
const cancelHeaderBtn = document.getElementById('cancelHeaderBtn');
const cancelFooterBtn = document.getElementById('cancelFooterBtn');

let headerContent = '';
let footerContent = '';
let mdContent = '';
let currentTheme = 'yellow';

const STORAGE_KEY_HEADER = 'wechat_md_header';
const STORAGE_KEY_FOOTER = 'wechat_md_footer';
const STORAGE_KEY_CONTENT = 'wechat_md_content';
const STORAGE_KEY_THEME = 'wechat_md_theme';

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.log('Storage save failed:', e);
  }
}

function loadFromStorage(key) {
  try {
    return localStorage.getItem(key) || '';
  } catch (e) {
    console.log('Storage load failed:', e);
    return '';
  }
}

function countWords(text) {
  if (!text) return 0;
  return text.replace(/\s/g, '').length;
}

async function loadThemeCSS() {
  let cssContent = '';
  const themes = ['yellow', 'purple', 'blue', 'orange', 'green'];
  
  // 基础样式
  cssContent += `
/* 预览内容基础样式 */
body {
  margin: 0;
  padding: 15px;
  color: #333;
  font-size: 16px;
  line-height: 1.8;
}
h1, h2, h3, h4, h5, h6 {
  margin: 1em 0 0.5em;
  font-weight: 600;
  color: #1a1a1a;
}
p {
  margin: 0.8em 0;
}
img {
  max-width: 100%;
  height: auto;
}
a {
  color: #576b95;
  text-decoration: none;
}
ul, ol {
  margin: 1em 0;
  padding-left: 1.5em;
}
li {
  margin: 0.3em 0;
}
table {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}
th, td {
  border: 1px solid #e5e5e5;
  padding: 8px 12px;
  text-align: left;
}
th {
  background: #f9f9f9;
}
`;
  
  // 加载所有主题CSS
  for (const theme of themes) {
    try {
      const response = await fetch(chrome.runtime.getURL(`themes/${theme}.css`));
      if (response.ok) {
        cssContent += await response.text();
      }
    } catch (e) {
      console.log('Theme CSS load failed:', theme, e);
    }
  }
  
  return cssContent;
}

let cachedThemeCSS = '';

async function updatePreview() {
  const md = mdEditor.value;
  const html = marked.parse(md, currentTheme);
  const fullHtml = '<div class="theme-' + currentTheme + '">' + html + '</div>';
  
  // 加载CSS（只加载一次）
  if (!cachedThemeCSS) {
    cachedThemeCSS = await loadThemeCSS();
  }
  
  // 构建完整的HTML文档
  const iframeHTML = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${cachedThemeCSS}</style>
  <style>
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: #f5f5f5;
    }
    ::-webkit-scrollbar-thumb {
      background: #ccc;
      border-radius: 3px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #aaa;
    }
  </style>
</head>
<body>
  ${headerContent}
  ${fullHtml}
  ${footerContent}
</body>
</html>
`;
  
  // 写入iframe
  const doc = previewIframe.contentDocument || previewIframe.contentWindow.document;
  doc.open();
  doc.write(iframeHTML);
  doc.close();
  
  wordCount.textContent = '字数: ' + countWords(md);
  mdContent = md;
  saveToStorage(STORAGE_KEY_CONTENT, md);
}

async function loadTemplate(filePath, isHeader) {
  try {
    const response = await fetch(chrome.runtime.getURL(filePath));
    if (response.ok) {
      const content = await response.text();
      if (isHeader) {
        headerContent = content;
        saveToStorage(STORAGE_KEY_HEADER, content);
      } else {
        footerContent = content;
        saveToStorage(STORAGE_KEY_FOOTER, content);
      }
      return content;
    }
  } catch (e) {
    console.log('Template file not found:', filePath);
  }
  return '';
}

mdEditor.addEventListener('input', updatePreview);

copyBtn.addEventListener('click', async () => {
  const md = mdEditor.value;
  const html = marked.parse(md, currentTheme);
  const fullHtml = headerContent + '<div class="theme-' + currentTheme + '">' + html + '</div>' + footerContent;

  try {
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const clipboardItem = new ClipboardItem({
      'text/html': blob,
      'text/plain': new Blob([fullHtml], { type: 'text/plain' })
    });
    await navigator.clipboard.write([clipboardItem]);
    showToast('复制成功！可直接粘贴到微信公众号编辑器');
  } catch (e) {
    try {
      await navigator.clipboard.writeText(fullHtml);
      showToast('复制成功！(纯文本模式)');
    } catch (e2) {
      showToast('复制失败，请手动复制');
    }
  }
});

headerBtn.addEventListener('click', () => {
  headerEditor.value = headerContent;
  headerModal.classList.add('show');
});

footerBtn.addEventListener('click', () => {
  footerEditor.value = footerContent;
  footerModal.classList.add('show');
});

saveHeaderBtn.addEventListener('click', () => {
  headerContent = headerEditor.value;
  saveToStorage(STORAGE_KEY_HEADER, headerContent);
  headerModal.classList.remove('show');
  updatePreview();
  showToast('顶部模板已保存');
});

saveFooterBtn.addEventListener('click', () => {
  footerContent = footerEditor.value;
  saveToStorage(STORAGE_KEY_FOOTER, footerContent);
  footerModal.classList.remove('show');
  updatePreview();
  showToast('底部模板已保存');
});

cancelHeaderBtn.addEventListener('click', () => {
  headerModal.classList.remove('show');
});

cancelFooterBtn.addEventListener('click', () => {
  footerModal.classList.remove('show');
});

loadHeaderBtn.addEventListener('click', async () => {
  const content = await loadTemplate(headerFile.value, true);
  if (content) {
    updatePreview();
    showToast('顶部模板已加载');
  } else {
    showToast('加载失败，文件不存在');
  }
});

loadFooterBtn.addEventListener('click', async () => {
  const content = await loadTemplate(footerFile.value, false);
  if (content) {
    updatePreview();
    showToast('底部模板已加载');
  } else {
    showToast('加载失败，文件不存在');
  }
});

themeBtn.addEventListener('click', () => {
  themeModal.classList.add('show');
});

cancelThemeBtn.addEventListener('click', () => {
  themeModal.classList.remove('show');
});

document.querySelectorAll('.theme-card').forEach(card => {
  card.addEventListener('click', () => {
    const theme = card.getAttribute('data-theme');
    setTheme(theme);
    themeModal.classList.remove('show');
    showToast('主题已切换：' + card.querySelector('.theme-name').textContent);
  });
});

function setTheme(theme) {
  currentTheme = theme;
  saveToStorage(STORAGE_KEY_THEME, theme);
  updatePreview();
}

async function init() {
  const savedHeader = loadFromStorage(STORAGE_KEY_HEADER);
  const savedFooter = loadFromStorage(STORAGE_KEY_FOOTER);
  const savedContent = loadFromStorage(STORAGE_KEY_CONTENT);
  const savedTheme = loadFromStorage(STORAGE_KEY_THEME);

  if (savedHeader) {
    headerContent = savedHeader;
  } else {
    await loadTemplate(headerFile.value, true);
  }

  if (savedFooter) {
    footerContent = savedFooter;
  } else {
    await loadTemplate(footerFile.value, false);
  }

  if (savedContent) {
    mdEditor.value = savedContent;
  } else {
    mdEditor.value = '# 欢迎使用微信文章编辑器\n\n在这里输入你的Markdown内容...\n\n## 支持的语法\n\n- **粗体** 和 *斜体*\n- [链接文字](https://example.com)\n- 图片：![alt文本](图片地址)\n- 引用：> 这是一段引用\n- 代码：`inline code`\n\n```javascript\n// 代码块\nfunction hello() {\n  console.log("Hello World");\n}\n```\n\n---\n\n| 表格 | 示例 |\n|------|------|\n| 第一行 | 内容 |\n';
  }

  if (savedTheme) {
    currentTheme = savedTheme;
  }

  setTheme(currentTheme);
  updatePreview();
}

init();