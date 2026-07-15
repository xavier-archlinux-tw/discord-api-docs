export const LanguageSelector = ({ current, path }) => {
  // SSR 階段與預設回退使用傳入的 path
  let ssrBaseRoute = path || '';
  ssrBaseRoute = ssrBaseRoute
    .replace('/developers/zh-tw/', '/developers/en-us/')
    .replace('/developers/bilingual/', '/developers/en-us/');
    
  if (ssrBaseRoute && !ssrBaseRoute.startsWith('/')) {
    ssrBaseRoute = '/' + ssrBaseRoute;
  }

  const ssrEnRoute = ssrBaseRoute;

  React.useEffect(() => {
    // 用戶端動態偵測真實 pathname，修復多重引入、Snippet/Wrapper 所致的 404 問題
    let currentPath = window.location.pathname || ssrEnRoute || '';
    currentPath = currentPath.replace(/\/$/, '');
    
    let baseRoute = currentPath;
    if (baseRoute.includes('/developers/zh-tw/')) {
      baseRoute = baseRoute.replace('/developers/zh-tw/', '/developers/en-us/');
    } else if (baseRoute.includes('/developers/bilingual/')) {
      baseRoute = baseRoute.replace('/developers/bilingual/', '/developers/en-us/');
    } else if (!baseRoute.startsWith('/developers/en-us/') && baseRoute.includes('/developers/')) {
      baseRoute = baseRoute.replace(/\/developers\/[a-zA-Z0-9_-]+\//, '/developers/en-us/');
    }

    if (baseRoute && !baseRoute.startsWith('/')) {
      baseRoute = '/' + baseRoute;
    }

    const enRoute = baseRoute;
    const zhRoute = baseRoute.replace('/developers/en-us/', '/developers/zh-tw/');
    const biRoute = baseRoute.replace('/developers/en-us/', '/developers/bilingual/');
    // 輔助函式：優先使用 Next.js 原生的 SPA 路由推送，避免整頁重新整理與觸發 On-demand 編譯
    const navigateSPA = (href) => {
      if (window.next && window.next.router) {
        window.next.router.push(href);
      } else {
        window.location.assign(href);
      }
    };

    // 1. 動態建立置中懸浮語言切換列 (掛載於 document.body 底下，徹底脫離主文 containment 限制)
    let langContainer = document.getElementById('language-selector-container');
    if (!langContainer) {
      langContainer = document.createElement('div');
      langContainer.id = 'language-selector-container';
      langContainer.style.cssText = `
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        background-color: rgba(20, 20, 30, 0.92);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 9999px;
        padding: 10px 24px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3);
        display: flex;
        gap: 16px;
        font-size: 14px;
        z-index: 2147483647; /* 使用最高 z-index，防禦任何頁尾 overlay 覆蓋 */
        backdrop-filter: blur(8px);
        align-items: center;
        pointer-events: auto; /* 確保點選不穿透 */
        transition: bottom 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      `;

      const activeColor = '#5865f2';
      const inactiveColor = '#9ca3af';

      const buildLink = (text, href, isActive) => {
        const a = document.createElement('a');
        a.href = href;
        a.innerText = text;
        a.style.color = isActive ? activeColor : inactiveColor;
        a.style.fontWeight = isActive ? 'bold' : 'normal';
        a.style.textDecoration = 'none';
        
        // 使用 Next.js Client-side Router push 來切換語系
        a.addEventListener('click', (e) => {
          e.preventDefault();
          navigateSPA(href);
        });

        return a;
      };

      const enLink = buildLink('🇬🇧 EN', enRoute, current === 'en');
      const zhLink = buildLink('🇹🇼 繁中', zhRoute, current === 'zh-tw');
      const biLink = buildLink('📖 雙語', biRoute, current === 'bilingual');

      const separator1 = document.createElement('span');
      separator1.innerText = '|';
      separator1.style.color = 'rgba(255, 255, 255, 0.2)';

      const separator2 = document.createElement('span');
      separator2.innerText = '|';
      separator2.style.color = 'rgba(255, 255, 255, 0.2)';

      langContainer.appendChild(enLink);
      langContainer.appendChild(separator1);
      langContainer.appendChild(zhLink);
      langContainer.appendChild(separator2);
      langContainer.appendChild(biLink);

      document.body.appendChild(langContainer);
    }

    // 4. 動態滾動監聽，防止滾動到底部時與 pagination 按鈕重疊
    const handleScroll = () => {
      const el = document.getElementById('language-selector-container');
      if (!el) return;
      // 偵測是否抵達最底部
      const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 160;
      if (isAtBottom) {
        el.style.bottom = '112px'; // 往上飄避開 Pagination 按鈕
      } else {
        el.style.bottom = '24px';
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // 如果當前是英文版，不執行後續的連結改寫與 Pagination 插入邏輯
    if (current === 'en') {
      return () => {
        const el = document.getElementById('language-selector-container');
        if (el) el.remove();
        window.removeEventListener('scroll', handleScroll);
      };
    }

    const langSegment = current === 'zh-tw' ? 'zh-tw' : 'bilingual';
    const activeColor = '#5865f2';

    // 全域 Capture 階段點擊攔截，完美防禦 React/Next.js VDOM 重新渲染覆蓋連結事件問題
    const handleGlobalClick = (e) => {
      const link = e.target.closest('a');
      if (!link) return;
      if (link.closest('#language-selector-container')) return;

      const originalHref = link.getAttribute('data-original-href');
      const currentHref = link.getAttribute('href') || '';

      if (originalHref || currentHref.startsWith('/developers/en-us/') || (link.classList.contains('nav-tabs-item') && currentHref.includes('/en-us/'))) {
        const baseHref = originalHref || currentHref;
        let targetHref = baseHref;
        if (baseHref.startsWith('/developers/en-us/')) {
          targetHref = baseHref.replace('/developers/en-us/', `/developers/${langSegment}/`);
        } else if (baseHref.includes('/en-us/')) {
          targetHref = baseHref.replace('/en-us/', `/${langSegment}/`);
        }

        // 額外處理 activities 路徑傳遞：
        // 如果當前頁面包含 activities，且目標 href 不包含 activities
        if (enRoute.includes('/activities/') && !targetHref.includes('/activities/')) {
          if (targetHref.includes('/discovery/')) {
            targetHref = targetHref.replace('/discovery/', '/activities/discovery/');
          } else if (targetHref.includes('/monetization/')) {
            targetHref = targetHref.replace('/monetization/', '/activities/monetization/');
          }
        }

        e.preventDefault();
        e.stopImmediatePropagation();
        navigateSPA(targetHref);
      }
    };
    document.addEventListener('click', handleGlobalClick, true);

    const rewriteAndHighlight = () => {
      try {
        // 1. 處理 Top Tab Navbar
        const tabLinks = document.querySelectorAll('a.nav-tabs-item');
        tabLinks.forEach(link => {
          const origHref = link.getAttribute('href') || '';
          if (origHref.includes('/en-us/') && !link.getAttribute('data-original-href')) {
            link.setAttribute('data-original-href', origHref);
            const newHref = origHref.replace('/en-us/', `/${langSegment}/`);
            link.setAttribute('href', newHref);
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
          if (link.closest('#language-selector-container')) {
            return;
          }

          let href = link.getAttribute('href') || '';
          if (href.startsWith('/developers/')) {
            // 如果當前在 activities 分區，且目標是 discovery 或 monetization 但無 activities，將其重寫
            if (enRoute.includes('/activities/')) {
              const discoveryPattern = /^\/developers\/(en-us|zh-tw|bilingual)\/discovery(\/.*)?$/;
              if (discoveryPattern.test(href) && !href.includes('/activities/')) {
                const updated = href.replace('/discovery', '/activities/discovery');
                link.setAttribute('data-original-href', href);
                link.setAttribute('href', updated);
                href = updated;
              }
              
              const monetizationPattern = /^\/developers\/(en-us|zh-tw|bilingual)\/monetization(\/.*)?$/;
              if (monetizationPattern.test(href) && !href.includes('/activities/')) {
                const updated = href.replace('/monetization', '/activities/monetization');
                link.setAttribute('data-original-href', href);
                link.setAttribute('href', updated);
                href = updated;
              }
            }

            // 原本的語系改寫
            if (href.startsWith('/developers/en-us/') && !link.getAttribute('data-original-href')) {
              link.setAttribute('data-original-href', href);
              const newHref = href.replace('/developers/en-us/', `/developers/${langSegment}/`);
              link.setAttribute('href', newHref);
              href = newHref;
            }
          }

          const updatedHref = link.getAttribute('href') || '';
          const expectedHref = `/developers/${langSegment}${enRoute.replace('/developers/en-us', '')}`;
          
          if (updatedHref === expectedHref || updatedHref === expectedHref + '/') {
            if (link.className.includes('items-start') || link.className.includes('text-gray-700') || link.className.includes('text-primary')) {
              link.setAttribute('aria-current', 'page');
              link.style.color = activeColor;
              link.style.borderColor = activeColor;
              link.style.textShadow = '-0.2px 0 0 currentColor, 0.2px 0 0 currentColor';
              
              const span = link.querySelector('span');
              if (span) {
                span.style.color = activeColor;
              }
            }
          } else {
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
      } catch (err) {
        console.error('[LanguageSelector] rewriteLinks error:', err);
      }
    };

    const injectPagination = () => {
      try {
        const prose = document.querySelector('.mdx-content');
        if (!prose) return;

        const sidebarLinks = [];
        document.querySelectorAll('a').forEach(link => {
          const href = link.getAttribute('href') || '';
          if (href.startsWith('/developers/')) {
            const isSidebarItem = link.className.includes('items-start') || 
                                  link.className.includes('text-gray-700') || 
                                  link.className.includes('text-primary');
            if (isSidebarItem) {
              if (!sidebarLinks.some(l => l.href === href)) {
                sidebarLinks.push({
                  href: href,
                  title: link.innerText || link.textContent || ''
                });
              }
            }
          }
        });

        if (sidebarLinks.length === 0) return;

        const currentPath = window.location.pathname.replace(/\/$/, '');
        let currentIndex = -1;
        
        for (let i = 0; i < sidebarLinks.length; i++) {
          if (sidebarLinks[i].href.replace(/\/$/, '') === currentPath) {
            currentIndex = i;
            break;
          }
        }

        if (currentIndex === -1) return;

        const prevPage = currentIndex > 0 ? sidebarLinks[currentIndex - 1] : null;
        const nextPage = currentIndex < sidebarLinks.length - 1 ? sidebarLinks[currentIndex + 1] : null;

        if (!prevPage && !nextPage) return;

        // 為 Pagination 的上一頁下一頁也套用 Next.js SPA 無刷新跳轉
        const setupPaginationLink = (el, href) => {
          if (!el) return;
          el.addEventListener('click', (e) => {
            e.preventDefault();
            navigateSPA(href);
          });
        };

        const prevHTML = prevPage 
          ? `<a id="custom-prev-btn" class="border border-gray-200/70 dark:border-gray-800/70 group flex items-center rounded-xl py-3 px-4 hover:border-gray-300 dark:hover:border-gray-700 justify-start gap-x-4" href="${prevPage.href}">
               <svg class="h-5 w-5 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
               </svg>
               <div class="space-y-1">
                 <div class="text-xs text-gray-500 dark:text-gray-500 uppercase font-semibold">Previous</div>
                 <div class="font-medium text-gray-900 dark:text-gray-200">${prevPage.title}</div>
               </div>
             </a>`
          : '<div></div>';

        const nextHTML = nextPage 
          ? `<a id="custom-next-btn" class="border border-gray-200/70 dark:border-gray-800/70 group flex items-center rounded-xl py-3 px-4 hover:border-gray-300 dark:hover:border-gray-700 justify-end gap-x-4 ml-auto" href="${nextPage.href}">
               <div class="space-y-1 text-right">
                 <div class="text-xs text-gray-500 dark:text-gray-500 uppercase font-semibold">Next</div>
                 <div class="font-medium text-gray-900 dark:text-gray-200">${nextPage.title}</div>
               </div>
               <svg class="h-5 w-5 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
               </svg>
             </a>`
          : '<div></div>';

        const newHTML = prevHTML + nextHTML;
        const prevHref = prevPage ? prevPage.href : '';
        const nextHref = nextPage ? nextPage.href : '';

        let container = document.getElementById('custom-pagination-container');
        let needsBinding = false;
        if (!container) {
          container = document.createElement('div');
          container.id = 'custom-pagination-container';
          container.className = 'grid grid-cols-1 gap-6 sm:grid-cols-2 mt-12 border-t border-gray-100 dark:border-gray-800/50 pt-8';
          needsBinding = true;
        }

        if (container.dataset.prevHref !== prevHref || container.dataset.nextHref !== nextHref) {
          container.dataset.prevHref = prevHref;
          container.dataset.nextHref = nextHref;
          container.innerHTML = newHTML;
          needsBinding = true;
        }

        if (needsBinding) {
          setupPaginationLink(container.querySelector('#custom-prev-btn'), prevHref);
          setupPaginationLink(container.querySelector('#custom-next-btn'), nextHref);
        }

        if (container.previousElementSibling !== prose) {
          prose.insertAdjacentElement('afterend', container);
        }
      } catch (err) {
        console.error('[LanguageSelector] injectPagination error:', err);
      }
    };

    const runAll = () => {
      rewriteAndHighlight();
      injectPagination();
    };

    runAll();

    const observer = new MutationObserver(runAll);
    observer.observe(document.body, { childList: true, subtree: true });

    const interval = setInterval(runAll, 1000);

    return () => {
      const el = document.getElementById('language-selector-container');
      if (el) el.remove();
      observer.disconnect();
      clearInterval(interval);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleGlobalClick, true);
    };
  }, [current, path]);

  return null;
};
