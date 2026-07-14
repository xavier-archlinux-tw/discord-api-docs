export const LanguageSelector = ({ current, path }) => {
  // 動態偵測瀏覽器當前 URL，確保在分流路由或嵌套 import 時能維持相同路由切換
  let currentPath = path || '';
  if (typeof window !== 'undefined') {
    currentPath = window.location.pathname;
  }
  
  // 去除結尾斜線
  currentPath = currentPath.replace(/\/$/, '');

  let enRoute = '';
  let zhRoute = '';
  let biRoute = '';

  if (currentPath.includes('/developers/zh-tw/')) {
    enRoute = currentPath.replace('/developers/zh-tw/', '/developers/en-us/');
    zhRoute = currentPath;
    biRoute = currentPath.replace('/developers/zh-tw/', '/developers/bilingual/');
  } else if (currentPath.includes('/developers/bilingual/')) {
    enRoute = currentPath.replace('/developers/bilingual/', '/developers/en-us/');
    zhRoute = currentPath.replace('/developers/bilingual/', '/developers/zh-tw/');
    biRoute = currentPath;
  } else {
    // 預設為 en-us
    const basePath = currentPath.includes('/developers/en-us/') 
      ? currentPath 
      : '/developers/en-us' + currentPath.replace('/developers/', '/');
    enRoute = basePath;
    zhRoute = basePath.replace('/developers/en-us/', '/developers/zh-tw/');
    biRoute = basePath.replace('/developers/en-us/', '/developers/bilingual/');
  }

  // 處理連結改寫與 Active 狀態高亮
  React.useEffect(() => {
    if (current === 'en') return;

    const langSegment = current === 'zh-tw' ? 'zh-tw' : 'bilingual';
    const activeColor = '#5865f2'; // Discord 經典紫色
    
    // 用於儲存註冊的事件清理函數
    const registeredHandlers = new Map();

    const rewriteAndHighlight = () => {
      // 1. 處理 Top Tab Navbar
      const tabLinks = document.querySelectorAll('a.nav-tabs-item');
      tabLinks.forEach(link => {
        const origHref = link.getAttribute('href') || '';
        if (origHref.includes('/en-us/')) {
          const newHref = origHref.replace('/en-us/', `/${langSegment}/`);
          link.setAttribute('href', newHref);
          
          if (!registeredHandlers.has(link)) {
            const handler = (e) => {
              e.preventDefault();
              e.stopImmediatePropagation();
              window.location.assign(newHref);
            };
            link.addEventListener('click', handler, true);
            registeredHandlers.set(link, handler);
          }
        }

        // 判斷是否為 Active tab
        const href = link.getAttribute('href') || '';
        const hrefParts = href.split('/').filter(Boolean);
        const routeParts = enRoute.split('/').filter(Boolean);
        if (hrefParts[2] === routeParts[2]) {
          link.setAttribute('data-active', 'true');
          link.setAttribute('aria-current', 'location');
          link.style.textShadow = '-0.2px 0 0 currentColor, 0.2px 0 0 currentColor';
          const indicator = link.querySelector('.absolute.bottom-0');
          if (indicator) {
            indicator.style.backgroundColor = activeColor;
          }
        } else {
          link.setAttribute('data-active', 'false');
          link.removeAttribute('aria-current');
          link.style.textShadow = '';
          const indicator = link.querySelector('.absolute.bottom-0');
          if (indicator) {
            indicator.style.backgroundColor = '';
          }
        }
      });

      // 2. 處理左側導覽列 (Sidebar) 與頁面內所有的 en-us 連結 (排除語言選單本身)
      const allLinks = document.querySelectorAll('a');
      allLinks.forEach(link => {
        // 排除語言切換按鈕本身的改寫
        if (link.closest('#language-selector-container')) {
          return;
        }

        const href = link.getAttribute('href') || '';
        
        // 如果是 en-us 連結，改寫為當前語言的連結
        if (href.includes('/en-us/')) {
          const newHref = href.replace('/en-us/', `/${langSegment}/`);
          link.setAttribute('href', newHref);

          if (!registeredHandlers.has(link)) {
            const handler = (e) => {
              e.preventDefault();
              e.stopImmediatePropagation();
              window.location.assign(newHref);
            };
            link.addEventListener('click', handler, true);
            registeredHandlers.set(link, handler);
          }
        }

        // 判斷該連結是否對應當前頁面的英文路徑，若是則高亮 (左側選單亮起)
        const updatedHref = link.getAttribute('href') || '';
        const expectedHref = `/developers/${langSegment}${enRoute.replace('/developers/en-us', '')}`;
        
        if (updatedHref === expectedHref || updatedHref === expectedHref + '/') {
          // 如果是 Sidebar 的選單項目
          if (link.className.includes('items-start') || link.className.includes('text-gray-700') || link.className.includes('text-primary')) {
            link.setAttribute('aria-current', 'page');
            link.style.color = activeColor;
            link.style.borderColor = activeColor;
            link.style.textShadow = '-0.2px 0 0 currentColor, 0.2px 0 0 currentColor';
            
            // 確保父元素或內部的 span 也呈現 active 顏色
            const span = link.querySelector('span');
            if (span) {
              span.style.color = activeColor;
            }
          }
        } else {
          // 清除其他項目的強行高亮
          if (link.getAttribute('aria-current') === 'page' && updatedHref !== expectedHref) {
            link.removeAttribute('aria-current');
            link.style.color = '';
            link.style.borderColor = '';
            link.style.textShadow = '';
            const span = link.querySelector('span');
            if (span) {
              span.style.color = '';
            }
          }
        }
      });
    };

    // 立即執行
    rewriteAndHighlight();

    // 使用 MutationObserver 監聽 DOM 動態變更，確保 Next.js 動態渲染後依然有效
    const observer = new MutationObserver(rewriteAndHighlight);
    observer.observe(document.body, { childList: true, subtree: true });

    // 定期輪詢作為最後的保險
    const interval = setInterval(rewriteAndHighlight, 1000);

    return () => {
      observer.disconnect();
      clearInterval(interval);
      registeredHandlers.forEach((handler, link) => {
        link.removeEventListener('click', handler, true);
      });
    };
  }, [current, enRoute]);

  const activeStyle = { 
    fontWeight: 'bold', 
    color: '#5865f2', // Discord 紫色
    textDecoration: 'none'
  };
  
  const inactiveStyle = { 
    color: '#9ca3af', // 灰色
    textDecoration: 'none'
  };

  return (
    <div
      id="language-selector-container"
      style={{
        position: 'fixed',
        top: '120px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(30, 30, 46, 0.85)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '9999px',
        padding: '8px 16px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        gap: '12px',
        fontSize: '13px',
        zIndex: 99999,
        backdropFilter: 'blur(8px)',
        alignItems: 'center',
      }}
    >
      <a href={enRoute} style={current === 'en' ? activeStyle : inactiveStyle}>
        🇬🇧 EN
      </a>
      <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>|</span>
      <a href={zhRoute} style={current === 'zh-tw' ? activeStyle : inactiveStyle}>
        🇹🇼 繁中
      </a>
      <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>|</span>
      <a href={biRoute} style={current === 'bilingual' ? activeStyle : inactiveStyle}>
        📖 雙語
      </a>
    </div>
  );
};
