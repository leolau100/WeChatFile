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
const footerSelectBtn = document.getElementById('footerSelectBtn');
const footerSelectModal = document.getElementById('footerSelectModal');
const cancelFooterSelectBtn = document.getElementById('cancelFooterSelectBtn');
const addFooterBtn = document.getElementById('addFooterBtn');
const footerList = document.getElementById('footerList');

let headerContent = '';
let footerContent = '';
let mdContent = '';
let currentTheme = 'yellow';

const STORAGE_KEY_HEADER = 'wechat_md_header';
const STORAGE_KEY_FOOTER = 'wechat_md_footer';
const STORAGE_KEY_CONTENT = 'wechat_md_content';
const STORAGE_KEY_THEME = 'wechat_md_theme';
const STORAGE_KEY_FOOTERS = 'wechat_md_footers';

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

function getSavedFooters() {
  try {
    const footers = localStorage.getItem(STORAGE_KEY_FOOTERS);
    if (footers) {
      return JSON.parse(footers);
    }
  } catch (e) {
    console.log('Get saved footers failed:', e);
  }
  return [];
}

function saveFooterList(footers) {
  try {
    localStorage.setItem(STORAGE_KEY_FOOTERS, JSON.stringify(footers));
  } catch (e) {
    console.log('Save footers failed:', e);
  }
}

function addCurrentFooterToCollection() {
  if (!footerContent || footerContent.trim() === '') {
    showToast('当前Footer为空，无法收藏');
    return;
  }
  
  const footers = getSavedFooters();
  const name = prompt('请输入Footer名称：', `Footer ${footers.length + 1}`);
  if (name) {
    footers.push({
      name: name,
      content: footerContent,
      id: Date.now()
    });
    saveFooterList(footers);
    renderFooterList();
    showToast('Footer收藏成功！');
  }
}

function renderFooterList() {
  const footers = getSavedFooters();
  footerList.innerHTML = '';
  
  if (footers.length === 0) {
    footerList.innerHTML = '<div style="text-align:center;color:#888;padding:20px;">暂无收藏的Footer</div>';
    return;
  }
  
  footers.forEach((footer, index) => {
    const item = document.createElement('div');
    item.style.cssText = 'border:1px solid #444;border-radius:8px;padding:12px;background:#2a2a2a;cursor:pointer;transition:all 0.2s;';
    item.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <span style="color:#fff;font-weight:bold;">${footer.name}</span>
        <button class="btn btn-danger" data-id="${footer.id}" style="padding:2px 8px;font-size:12px;">删除</button>
      </div>
      <div style="color:#888;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${footer.content.substring(0, 100)}...</div>
    `;
    
    item.addEventListener('click', (e) => {
      if (e.target.tagName !== 'BUTTON') {
        footerContent = footer.content;
        saveToStorage(STORAGE_KEY_FOOTER, footerContent);
        updatePreview();
        footerSelectModal.classList.remove('show');
        showToast('Footer已应用！');
      }
    });
    
    const deleteBtn = item.querySelector('button');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm('确定要删除这个Footer吗？')) {
        const newFooters = footers.filter(f => f.id !== footer.id);
        saveFooterList(newFooters);
        renderFooterList();
        showToast('Footer已删除');
      }
    });
    
    footerList.appendChild(item);
  });
}

async function updatePreview() {
  const md = mdEditor.value;
  const html = marked.parse(md, currentTheme);
  
  // 构建完整的HTML文档，只使用内联style
  const iframeHTML = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
<body style="margin:0;padding:15px;color:#333;font-size:16px;line-height:1.8;overflow-x:hidden;word-wrap:break-word;word-break:break-word;box-sizing:border-box;">
  <section style="margin: 0; padding: 0;">
  ${headerContent}
  ${html}
  ${footerContent}
  </section>
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
  const fullHtml = '<section style="margin: 0; padding: 0;">' + headerContent + html + footerContent + '</section>';

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

footerSelectBtn.addEventListener('click', () => {
  renderFooterList();
  footerSelectModal.classList.add('show');
});

cancelFooterSelectBtn.addEventListener('click', () => {
  footerSelectModal.classList.remove('show');
});

addFooterBtn.addEventListener('click', addCurrentFooterToCollection);

const resetBtn = document.getElementById('resetBtn');
resetBtn.addEventListener('click', async () => {
  if (confirm('确定要重置所有缓存吗？这将清除所有保存的内容、模板和Footer收藏。')) {
    localStorage.clear();
    await init();
    showToast('缓存已重置！');
  }
});

function setTheme(theme) {
  currentTheme = theme;
  saveToStorage(STORAGE_KEY_THEME, theme);
  updatePreview();
}

function parseFooterFile(content) {
  let title = '';
  let htmlContent = content;
  
  // 解析 front matter
  const frontMatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (frontMatterMatch) {
    const frontMatter = frontMatterMatch[1];
    htmlContent = frontMatterMatch[2];
    
    // 提取 title
    const titleMatch = frontMatter.match(/title:\s*["']?(.*?)["']?\s*$/m);
    if (titleMatch) {
      title = titleMatch[1];
    }
  }
  
  return { title, content: htmlContent.trim() };
}

async function loadFooterFromFile(fileName) {
  try {
    const response = await fetch(chrome.runtime.getURL(`footer/${fileName}`));
    if (response.ok) {
      const text = await response.text();
      const { title, content } = parseFooterFile(text);
      return {
        name: title || fileName.replace(/\.(md|html)$/i, ''),
        content: content,
        id: Date.now() + Math.random()
      };
    }
  } catch (e) {
    console.log(`Load footer ${fileName} failed:`, e);
  }
  return null;
}

const defaultFooterHtml = `<section style="margin: 0; padding: 0;">
<p style="margin: 30px 0 20px 0; border-top: 1px solid #eeeeee; font-size: 1px; line-height: 1px;">&nbsp;</p>

<table style="width: 100%; border: none; margin: 0 0 20px 0; border-collapse: collapse;">
  <tr>
    <td style="width: 4px; background-color: #f7b500; border-radius: 2px; vertical-align: middle;"></td>
    <td style="padding-left: 8px; font-size: 14px; font-weight: bold; color: #333333; line-height: 15px;">关于作者</td>
  </tr>
</table>

<p style="margin: 0 0 0 12px; font-size: 13px; color: #555555; line-height: 1.6; text-align: justify;">
  常驻硅谷与前沿技术一线的科技评论员，前硬核科技媒体主笔。深耕 AI 行业、智能硬件与数字化转型领域，致力于用剥离滤镜的客观视角，拆解科技演进背后的真实商业逻辑与技术真相。
</p>

<table style="width: 100%; border: none; margin: 25px 0 20px 0; border-collapse: collapse;">
  <tr>
    <td style="width: 4px; background-color: #f7b500; border-radius: 2px; vertical-align: middle;"></td>
    <td style="padding-left: 8px; font-size: 14px; font-weight: bold; color: #333333; line-height: 15px;">关于本号</td>
  </tr>
</table>

<p style="margin: 0 0 0 12px; font-size: 13px; color: #555555; line-height: 1.6; text-align: justify;">
  不跟风，不造神。我们是一家专注科技趋势深度复盘、硬核产业拆解的原创内容基地。每周为您奉上最硬核的行业内幕观察与通俗易懂的技术底层剖析。
</p>

<table style="width: 100%; border: 1px solid #eeeeee; background-color: #fafafa; border-radius: 12px; margin: 25px 0 0 0; border-collapse: separate;">
  <tr>
    <td style="padding: 18px; vertical-align: top;">
      <h4 style="margin: 0 0 6px 0; font-size: 16px; color: #222222; font-weight: 600; line-height: 1.4;">
        欢迎关注 "公众"
      </h4>
      <p style="margin: 0 0 4px 0; font-size: 12px; color: #666666; line-height: 1.4;">
        在这里，换个姿势看懂科技未来。
      </p>
      <p style="margin: 0; font-size: 11px; color: #999999; line-height: 1.4;">
        💡 长按右侧二维码，识别并关注本号
      </p>
    </td>
    <td style="width: 92px; padding: 18px; vertical-align: middle;">
      <div style="width: 84px; height: 84px; background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 4px; display: table-cell; vertical-align: middle; text-align: center;">
        <img src="" alt="二维码" style="width: 100%; height: 100%; object-fit: contain; display: block;" />
      </div>
    </td>
  </tr>
</table>
</section>`;

async function init() {
  const savedHeader = loadFromStorage(STORAGE_KEY_HEADER);
  const savedFooter = loadFromStorage(STORAGE_KEY_FOOTER);
  const savedContent = loadFromStorage(STORAGE_KEY_CONTENT);
  const savedTheme = loadFromStorage(STORAGE_KEY_THEME);

  // 初始化默认Footer收藏
  const savedFooters = getSavedFooters();
  if (savedFooters.length === 0) {
    const defaultFooters = [];
    // 尝试从footer文件夹加载文件
    const footerFile = await loadFooterFromFile('footeer1.md');
    if (footerFile) {
      defaultFooters.push(footerFile);
    } else {
      defaultFooters.push({
        name: '关于作者、关于本号',
        content: defaultFooterHtml,
        id: 1
      });
    }
    saveFooterList(defaultFooters);
  }

  if (savedHeader) {
    headerContent = savedHeader;
  } else {
    await loadTemplate(headerFile.value, true);
  }

  if (savedFooter) {
    footerContent = savedFooter;
  } else {
    // 使用第一个收藏的footer
    const footers = getSavedFooters();
    if (footers.length > 0) {
      footerContent = footers[0].content;
    } else {
      footerContent = defaultFooterHtml;
    }
    saveToStorage(STORAGE_KEY_FOOTER, footerContent);
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