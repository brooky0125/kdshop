// scripts/generate-placeholder-images.js
// 在還沒有實際商品照片之前，先產生符合 CIS 配色的簡易佔位圖（SVG），
// 之後有實拍照片／設計稿圖片時，直接透過後台上傳覆蓋即可，不影響資料結構。
'use strict';

const fs = require('fs');
const path = require('path');
const { products } = require('./seed');

const OUT_DIR = path.join(__dirname, '..', 'public', 'images', 'products');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const PALETTE = [
  ['#1f3a2e', '#a8d5ba'],
  ['#d9a441', '#faf7f0'],
  ['#f2c94c', '#1f3a2e'],
  ['#a8d5ba', '#142821'],
];

function escapeXml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;',
  }[c]));
}

function wrapText(text, maxCharsPerLine) {
  const words = text.split('');
  const lines = [];
  let current = '';
  for (const ch of words) {
    current += ch;
    if (current.length >= maxCharsPerLine) {
      lines.push(current);
      current = '';
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 3);
}

function makeSvg(name, brand, idx) {
  const [bg, fg] = PALETTE[idx % PALETTE.length];
  const lines = wrapText(name, 10);
  const lineHeight = 34;
  const startY = 320 - ((lines.length - 1) * lineHeight) / 2;

  const textLines = lines
    .map(
      (line, i) =>
        `<text x="240" y="${startY + i * lineHeight}" font-size="26" font-family="'Noto Sans TC','PingFang TC',sans-serif" fill="${fg}" text-anchor="middle" font-weight="700">${escapeXml(
          line
        )}</text>`
    )
    .join('\n    ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="600" viewBox="0 0 480 600">
  <rect width="480" height="600" fill="${bg}"/>
  <circle cx="240" cy="200" r="90" fill="${fg}" opacity="0.15"/>
  <rect x="150" y="150" width="180" height="20" rx="10" fill="${fg}" opacity="0.5" transform="rotate(-18 240 160)"/>
  ${textLines}
  <text x="240" y="${startY + lines.length * lineHeight + 20}" font-size="15" font-family="'Noto Sans TC',sans-serif" fill="${fg}" text-anchor="middle" opacity="0.75">${escapeXml(
    brand
  )}</text>
  <text x="240" y="570" font-size="12" font-family="'Noto Sans TC',sans-serif" fill="${fg}" text-anchor="middle" opacity="0.5">KD 全得文具・示意圖，正式圖片請於後台上傳</text>
</svg>`;
}

// 給 banner 用的純背景圖（不印文字——標題/副標題已經是 HTML 疊字顯示，
// 圖上再印一次文字會跟疊字重疊變得很亂）。
function makeBannerBg(idx) {
  const [bg, fg] = PALETTE[idx % PALETTE.length];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="600" viewBox="0 0 1600 600">
  <rect width="1600" height="600" fill="${bg}"/>
  <circle cx="1300" cy="150" r="220" fill="${fg}" opacity="0.12"/>
  <circle cx="120" cy="480" r="160" fill="${fg}" opacity="0.1"/>
  <rect x="900" y="380" width="420" height="34" rx="17" fill="${fg}" opacity="0.15" transform="rotate(-10 1110 397)"/>
</svg>`;
}

function run() {
  products.forEach((p, idx) => {
    const filename = path.basename(p.image);
    const svg = makeSvg(p.name, p.brand, idx);
    fs.writeFileSync(path.join(OUT_DIR, filename), svg, 'utf8');
  });

  // 通用佔位圖（新建商品但還沒上傳圖片時使用）
  const genericSvg = makeSvg('全得文具\nKD Stationery', '尚未上傳商品圖片', 0);
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'images', 'placeholder.svg'), genericSvg, 'utf8');

  console.log(`已產生 ${products.length} 張商品佔位圖 + 1 張通用佔位圖於 public/images/`);
}

if (require.main === module) run();

module.exports = { run, makeSvg, makeBannerBg };
