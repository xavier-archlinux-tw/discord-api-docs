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

  // 當不是英文版時，修正 Mintlify Tab navbar 的 active 狀態
  useEffect(() => {
    if (current === 'en') return;

    const fixTabActive = () => {
      const tabLinks = document.querySelectorAll('a.nav-tabs-item');
      if (!tabLinks.length) return;

      // 找到對應 tab：href 的第三個路徑段（section）需與 enRoute 相同
      // e.g. enRoute = /developers/en-us/activities/... -> section = "activities"
      const routeParts = enRoute.split('/').filter(Boolean);
      // routeParts = ["developers", "en-us", "activities", ...]
      const targetSection = routeParts[2]; // "activities", "guides", etc.

      let targetTab = null;
      for (const link of tabLinks) {
        const href = link.getAttribute('href') || '';
        const hrefParts = href.split('/').filter(Boolean);
        // hrefParts = ["developers", "en-us", "activities", "overview"]
        if (hrefParts[2] === targetSection) {
          targetTab = link;
          break;
        }
      }

      if (!targetTab) return;

      // 重置所有 tab 為未選中狀態（直接操作 style，可靠性高於 class 操作）
      tabLinks.forEach(link => {
        link.setAttribute('data-active', 'false');
        link.removeAttribute('aria-current');
        link.style.fontWeight = '';
        link.style.textShadow = '';
        link.style.color = '';
        // 底線指示器
        const indicator = link.querySelector('.absolute.bottom-0');
        if (indicator) {
          indicator.style.backgroundColor = '';
          indicator.style.background = '';
        }
      });

      // 設定目標 tab 為 active 狀態
      targetTab.setAttribute('data-active', 'true');
      targetTab.setAttribute('aria-current', 'location');
      // 模擬 Mintlify active 樣式（text-shadow 讓文字視覺上變粗）
      targetTab.style.textShadow = '-0.2px 0 0 currentColor, 0.2px 0 0 currentColor';
      // 底線指示器：使用主色
      const indicator = targetTab.querySelector('.absolute.bottom-0');
      if (indicator) {
        indicator.style.backgroundColor = 'var(--primary, #5865f2)';
      }
    };

    // 立即執行 + 延遲重試（等待 Mintlify hydration 完成）
    fixTabActive();
    const t1 = setTimeout(fixTabActive, 150);
    const t2 = setTimeout(fixTabActive, 500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [current, enRoute]);

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
