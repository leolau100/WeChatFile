const htmlEditor = document.getElementById('htmlEditor');
const previewFrame = document.getElementById('previewFrame');
const headerFileInput = document.getElementById('headerFile');
const footerFileInput = document.getElementById('footerFile');
const copyBtn = document.getElementById('copyBtn');
const refreshBtn = document.getElementById('refreshBtn');
const editHeaderBtn = document.getElementById('editHeaderBtn');
const editFooterBtn = document.getElementById('editFooterBtn');
const settingsBtn = document.getElementById('settingsBtn');
const toast = document.getElementById('toast');

let headerContent = '';
let footerContent = '';
let isEditingHeader = false;
let isEditingFooter = false;
const STORAGE_KEY_HEADER = 'wechat_editor_header';
const STORAGE_KEY_FOOTER = 'wechat_editor_footer';

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.log('LocalStorage save failed:', e);
  }
}

function loadFromStorage(key) {
  try {
    return localStorage.getItem(key) || '';
  } catch (e) {
    console.log('LocalStorage load failed:', e);
    return '';
  }
}

async function loadTemplate(filePath, isHeader) {
  try {
    const response = await fetch(chrome.runtime.getURL(filePath));
    if (response.ok) {
      const content = await response.text();
      if (isHeader) {
        headerContent = content;
      } else {
        footerContent = content;
      }
      return content;
    }
  } catch (e) {
    console.log('Template file not found or cannot be loaded:', filePath);
  }
  return '';
}

function updatePreview() {
  const html = htmlEditor.value;
  const fullHtml = headerContent + html + footerContent;
  const doc = previewFrame.contentDocument || previewFrame.contentWindow.document;
  doc.open();
  doc.write(fullHtml);
  doc.close();
}

async function refreshAll() {
  await loadTemplate(headerFileInput.value, true);
  await loadTemplate(footerFileInput.value, false);
  saveToStorage(STORAGE_KEY_HEADER, headerContent);
  saveToStorage(STORAGE_KEY_FOOTER, footerContent);
  updatePreview();
  showToast('已重置为文件内容');
}

htmlEditor.addEventListener('input', () => {
  if (!isEditingHeader && !isEditingFooter) {
    updatePreview();
  }
});

refreshBtn.addEventListener('click', () => {
  if (confirm('确定要重置吗？这将恢复到文件中的原始内容，您的修改将丢失。')) {
    refreshAll();
  }
});

copyBtn.addEventListener('click', async () => {
  const html = htmlEditor.value;
  const fullHtml = headerContent + html + footerContent;

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

editHeaderBtn.addEventListener('click', () => {
  if (isEditingHeader) {
    headerContent = htmlEditor.value;
    saveToStorage(STORAGE_KEY_HEADER, headerContent);
    isEditingHeader = false;
    editHeaderBtn.textContent = '编辑';
    updatePreview();
    showToast('顶部模板已保存');
  } else {
    htmlEditor.value = headerContent;
    isEditingHeader = true;
    isEditingFooter = false;
    editHeaderBtn.textContent = '保存';
    editFooterBtn.textContent = '编辑';
    showToast('正在编辑顶部模板');
  }
});

editFooterBtn.addEventListener('click', () => {
  if (isEditingFooter) {
    footerContent = htmlEditor.value;
    saveToStorage(STORAGE_KEY_FOOTER, footerContent);
    isEditingFooter = false;
    editFooterBtn.textContent = '编辑';
    updatePreview();
    showToast('底部模板已保存');
  } else {
    htmlEditor.value = footerContent;
    isEditingFooter = true;
    isEditingHeader = false;
    editFooterBtn.textContent = '保存';
    editHeaderBtn.textContent = '编辑';
    showToast('正在编辑底部模板');
  }
});

settingsBtn.addEventListener('click', () => {
  isEditingHeader = false;
  isEditingFooter = false;
  editHeaderBtn.textContent = '编辑';
  editFooterBtn.textContent = '编辑';
  htmlEditor.value = '';
  showToast('已切换回编辑模式');
});

async function init() {
  const savedHeader = loadFromStorage(STORAGE_KEY_HEADER);
  const savedFooter = loadFromStorage(STORAGE_KEY_FOOTER);
  
  await loadTemplate(headerFileInput.value, true);
  await loadTemplate(footerFileInput.value, false);
  
  if (savedHeader) {
    headerContent = savedHeader;
  }
  if (savedFooter) {
    footerContent = savedFooter;
  }
  
  htmlEditor.value = '<h2>欢迎使用微信文章编辑器</h2>\n<p>在这里输入你的文章内容...</p>';
  updatePreview();
}

init();