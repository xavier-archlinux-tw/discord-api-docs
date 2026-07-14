import fs from 'fs';
import path from 'path';

const targetDir = './developers/bilingual';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else {
      if (file.endsWith('.mdx')) {
        results.push(filePath);
      }
    }
  });
  return results;
}

try {
  const mdxFiles = walk(targetDir);
  mdxFiles.forEach((filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 將行首縮排的 <div> 或 </div> 替換為靠左對齊
    const newContent = content
      .replace(/^\s+<div>/gm, '<div>')
      .replace(/^\s+<\/div>/gm, '</div>');
      
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`已修正：${filePath}`);
    }
  });
} catch (error) {
  console.error('修正 MDX divs 時發生錯誤:', error);
  process.exit(1);
}
