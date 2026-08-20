// scripts/seed-banners.js
// 建立範例首頁 Banner（示意用，圖片與文案上線前請於後台替換）
'use strict';

const fs = require('fs');
const path = require('path');
const db = require('../lib/db');
const banners = require('../lib/banners');
const { makeBannerBg } = require('./generate-placeholder-images');

const OUT_DIR = path.join(__dirname, '..', 'public', 'images', 'banners');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const sampleBanners = [
  {
    title: 'IP 聯名話題新品到貨',
    subtitle: 'PILOT × chiikawa・Zebra × 三麗鷗，數量有限、售完為止',
    file: 'banner-ip-collab.svg',
    link_url: '/products?category=%E9%99%90%E9%87%8F%E5%95%86%E5%93%81',
    sort_order: 1,
  },
  {
    title: '開學季全力衝刺',
    subtitle: '書寫工具・修正帶・兒童文具，開學必備一次備齊',
    file: 'banner-back-to-school.svg',
    link_url: '/products',
    sort_order: 2,
  },
];

function run() {
  const existing = banners.listAllBanners();
  if (existing.length > 0) {
    console.log('已存在 banner 資料，略過範例 banner 匯入。');
    return;
  }
  sampleBanners.forEach((b, idx) => {
    const svg = makeBannerBg(idx);
    fs.writeFileSync(path.join(OUT_DIR, b.file), svg, 'utf8');
    banners.createBanner({
      title: b.title,
      subtitle: b.subtitle,
      image: `/images/banners/${b.file}`,
      link_url: b.link_url,
      is_active: 1,
      sort_order: b.sort_order,
    });
  });
  console.log(`已建立 ${sampleBanners.length} 筆範例 banner。`);
}

if (require.main === module) run();
module.exports = { run };
