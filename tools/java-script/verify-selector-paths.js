import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const testUrl = 'http://mintlify-dev-server:3000/developers/en-us/activities/rich-presence/using-with-the-embedded-app-sdk';
  console.log(`Navigating to wrapper page: ${testUrl}`);
  
  await page.goto(testUrl);
  await page.waitForSelector('#language-selector-container', { timeout: 15000 });
  
  const links = await page.evaluate(() => {
    const container = document.getElementById('language-selector-container');
    if (!container) return null;
    const anchors = Array.from(container.querySelectorAll('a'));
    return anchors.map(a => ({
      text: a.innerText,
      href: a.getAttribute('href')
    }));
  });
  
  console.log('LanguageSelector Links Detected:');
  console.log(JSON.stringify(links, null, 2));
  
  if (!links) {
    console.error('❌ Failed: LanguageSelector container not found!');
    process.exit(1);
  }
  
  const zhLink = links.find(l => l.text.includes('繁中'));
  const biLink = links.find(l => l.text.includes('雙語'));
  
  const expectedZh = '/developers/zh-tw/activities/rich-presence/using-with-the-embedded-app-sdk';
  const expectedBi = '/developers/bilingual/activities/rich-presence/using-with-the-embedded-app-sdk';
  
  if (zhLink.href !== expectedZh || biLink.href !== expectedBi) {
    console.error(`❌ Mismatch detected!`);
    console.error(`Expected ZH: ${expectedZh}, Got: ${zhLink.href}`);
    console.error(`Expected BI: ${expectedBi}, Got: ${biLink.href}`);
    process.exit(1);
  }
  
  console.log('✅ Links are 100% correct and stay in the wrapper activities path hierarchy!');
  
  // Test monetization page as well
  const testUrl2 = 'http://mintlify-dev-server:3000/developers/en-us/activities/monetization/overview';
  console.log(`Navigating to monetization page: ${testUrl2}`);
  await page.goto(testUrl2);
  await page.waitForSelector('#language-selector-container', { timeout: 15000 });
  
  const links2 = await page.evaluate(() => {
    const container = document.getElementById('language-selector-container');
    if (!container) return null;
    const anchors = Array.from(container.querySelectorAll('a'));
    return anchors.map(a => ({
      text: a.innerText,
      href: a.getAttribute('href')
    }));
  });
  
  console.log('LanguageSelector Links on Monetization Page:');
  console.log(JSON.stringify(links2, null, 2));
  
  const zhMonetizationLink = links2.find(l => l.text.includes('繁中'));
  const expectedZhMonetization = '/developers/zh-tw/activities/monetization/overview';
  if (zhMonetizationLink.href !== expectedZhMonetization) {
    console.error(`❌ Mismatch on monetization page! Expected: ${expectedZhMonetization}, Got: ${zhMonetizationLink.href}`);
    process.exit(1);
  }
  console.log('✅ Monetization page links are also 100% correct!');
  
  await browser.close();
  console.log('🎉 All Batch 6.5 dynamic routing tests passed!');
})();
