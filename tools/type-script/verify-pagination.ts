import { chromium, Browser, Page } from 'playwright';

const TARGET_HOST: string = process.env.TARGET_HOST || 'http://localhost:3000';

(async () => {
  console.log(`正在使用測試主機: ${TARGET_HOST}`);
  const browser: Browser = await chromium.launch({ headless: true });
  const page: Page = await browser.newPage();
  
  await page.setViewportSize({ width: 1280, height: 800 });

  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[LanguageSelector]') || msg.type() === 'error') {
      console.log('瀏覽器 LOG:', text);
    }
  });

  const verifyLayout = async (pageName: string) => {
    // 1. 取得主體 prose 和自訂導航按鈕的 Y 軸位置關係
    const biLayout = await page.evaluate(() => {
      const container = document.getElementById('custom-pagination-container');
      const prose = document.querySelector('.mdx-content');
      if (!container || !prose) return null;

      const containerRect = container.getBoundingClientRect();
      const proseRect = prose.getBoundingClientRect();

      return {
        containerY: containerRect.y + window.scrollY,
        proseBottomY: proseRect.y + proseRect.height + window.scrollY
      };
    });

    if (biLayout) {
      console.log(`${pageName}自訂導航位置比對：導航Y軸=${biLayout.containerY}，正文底部Y軸=${biLayout.proseBottomY}`);
      if (biLayout.containerY < biLayout.proseBottomY - 10) {
        console.error(`❌ 視覺佈局驗證失敗：導航元件位置 (${biLayout.containerY}) 沒有在正文最下方 (${biLayout.proseBottomY})！`);
        process.exit(1);
      }
    } else {
      console.error(`❌ 驗證失敗：${pageName}找不到 id="custom-pagination-container" 的元件或正文。`);
      process.exit(1);
    }

    // 2. 滾動到底部，驗證語言選單依然存在且處於最頂層，無遮擋且位置往上移動
    console.log('正在模擬滾動到底部...');
    await page.evaluate(() => {
      window.scrollTo(0, document.documentElement.scrollHeight);
    });
    await page.waitForTimeout(2000); // 等待 scroll 避讓動畫

    const menuState = await page.evaluate(() => {
      const el = document.getElementById('language-selector-container');
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // 取得語言列中點的頂層元素
      const centerX = rect.x + rect.width / 2;
      const centerY = rect.y + rect.height / 2;
      let topTagName = 'none';
      const topEl = document.elementFromPoint(centerX, centerY);
      if (topEl) {
        topTagName = topEl.tagName;
      }

      return {
        y: rect.y,
        bottomStyle: window.getComputedStyle(el).bottom,
        positionStyle: window.getComputedStyle(el).position,
        zIndex: window.getComputedStyle(el).zIndex,
        isInViewport: rect.y >= 0 && rect.y + rect.height <= viewportHeight,
        topTagName: topTagName
      };
    });

    if (menuState) {
      console.log(`${pageName}語言選單底部診斷：Y軸=${menuState.y}，bottom屬性=${menuState.bottomStyle}，position=${menuState.positionStyle}，zIndex=${menuState.zIndex}，可見=${menuState.isInViewport}，頂層元素=${menuState.topTagName}`);
      
      if (menuState.positionStyle !== 'fixed') {
        console.error(`❌ 驗證失敗：${pageName}語言列 position 不是 fixed！實際為 ${menuState.positionStyle}`);
        process.exit(1);
      }
      if (!menuState.isInViewport) {
        console.error(`❌ 驗證失敗：${pageName}語言列在最底部時滾出了視窗！`);
        process.exit(1);
      }
      if (menuState.bottomStyle !== '112px') {
        console.error(`❌ 驗證失敗：${pageName}語言列在最底部時沒有避讓（bottom 應為 112px，實際為 ${menuState.bottomStyle}）`);
        process.exit(1);
      }
      // 頂層元素應該是 A 或者是 DIV (語言選單自身)
      if (menuState.topTagName !== 'A' && menuState.topTagName !== 'DIV') {
        console.error(`❌ 驗證失敗：${pageName}語言選單被其他元素覆蓋了！最頂層元素為 ${menuState.topTagName}`);
        process.exit(1);
      }
      console.log(`✅ ${pageName}語言選單在底部驗證成功！無遮擋、固定定位、且避讓正確。`);
    } else {
      console.error(`❌ 驗證失敗：${pageName}找不到語言選單元件。`);
      process.exit(1);
    }
  };

  console.log('1. 正在導航至雙語版頁面...');
  await page.goto(`${TARGET_HOST}/developers/bilingual/activities/how-activities-work`);
  await page.waitForSelector('.mdx-content', { timeout: 15000 });
  await page.waitForTimeout(2000);
  await verifyLayout('雙語版');

  console.log('2. 正在導航至中文版頁面...');
  await page.goto(`${TARGET_HOST}/developers/zh-tw/activities/how-activities-work`);
  await page.waitForSelector('.mdx-content', { timeout: 15000 });
  await page.waitForTimeout(2000);
  await verifyLayout('中文版');

  await browser.close();
  console.log('🎉 所有自動化 Playwright TypeScript 驗證皆已成功通過！');
})();
