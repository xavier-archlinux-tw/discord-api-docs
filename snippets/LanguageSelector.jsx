import React from 'react';

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

  const activeStyle = { 
    fontWeight: 'bold', 
    color: '#5865f2', // Discord 經典寶藍色
    textDecoration: 'none'
  };
  
  const inactiveStyle = { 
    color: '#9ca3af', // 灰色
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
        borderRadius: '9999px 0px 0px 9999px', // 圓角朝左，貼齊右側邊緣
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
