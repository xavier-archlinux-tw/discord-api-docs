import fs from 'fs';

const html = fs.readFileSync('en.html', 'utf8');

const pagIndex = html.indexOf('id="pagination"');
if (pagIndex !== -1) {
  // 我們找到 #pagination 的結束 </div>。
  // 因為 #pagination 內有兩個 <a> 標籤，每個 <a> 內有一些 div，所以我們可以直接找這個 container 的結束標籤。
  // 我們可以直接印出 #pagination 往後 2500 個字元。
  console.log('--- HTML AFTER #pagination ---');
  console.log(html.substring(pagIndex + 500, pagIndex + 3000));
}
