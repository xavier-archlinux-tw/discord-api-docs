import React, { useEffect } from 'react';

export const LanguageSelector = ({ current, path }) => {
  // 清理與轉換路由路徑，確保基本英文路由正確
  let baseRoute = path || '';
  baseRoute = baseRoute
    .replace('/developers/zh-tw/', '/developers/en-us/')
    .replace('/developers/bilingual/', '/developers/en-us/');
    
  if (baseRoute && !baseRoute.startsWith('/')) {
    baseRoute = '/' + baseRoute;
  }

  const enRoute = baseRoute;
  const zhRoute = baseRoute.replace('/developers/en-us/', '/developers/zh-tw/');
  const biRoute = baseRoute.replace('/developers/en-us/', '/developers/bilingual/');

  // 當處於非英文頁面時，把 Top Nav Tab 的連結改為指向當前語言版本
  useEffect(() => {
    if (current === 'en') return;

    const langSegment = current === 'zh-tw' ? 'zh-tw' : 'bilingual';
    const cleanupFns = [];
    let applied = false;

    const rewriteTabLinks = () => {
      if (applied) return;

      const tabLinks = document.querySelectorAll('a.nav-tabs-item');
      if (!tabLinks.length) return;

      applied = true;
      tabLinks.forEach(link => {
        const origHref = link.getAttribute('href') || '';
        // 只改 en-us 的路徑
        if (!origHref.includes('/en-us/')) return;

        const newHref = origHref.replace('/en-us/', `/${langSegment}/`);

        // 更新 href 屬性（用於視覺 tooltip / 右鍵選單）
        link.setAttribute('href', newHref);

        // 在 capture 階段攔截點擊，覆蓋 Next.js 的 router.push
        const handler = (e) => {
          e.preventDefault();
          e.stopImmediatePropagation();
          window.location.assign(newHref);
        };
        link.addEventListener('click', handler, true); // capture: true 確保最先執行
        cleanupFns.push(() => link.removeEventListener('click', handler, true));
      });
    };

    // 立即嘗試；若 Mintlify hydration 尚未完成，則延遲重試
    rewriteTabLinks();
    const t = setTimeout(rewriteTabLinks, 300);

    return () => {
      clearTimeout(t);
      cleanupFns.forEach(fn => fn());
    };
  }, [current]);

  const activeStyle = { 
    fontWeight: 'bold', 
    color: '#5865f2',
    textDecoration: 'none'
  };
  
  const inactiveStyle = { 
    color: '#9ca3af',
    textDecoration: 'none'
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '120px',
        right: '0px',
        backgroundColor: 'rgba(30, 30, 46, 0.85)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '9999px 0px 0px 9999px',
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
