// scripts/seed.js
// 匯入範例商品資料（依「全得社群行銷提案 2026」PDF 中的明星商品 TOP10 ＋ IP 聯名／話題商品）
// category 沿用舊站（kdshop.com.tw）既有的分類架構，tag 則是更細的商品類型標籤。
// 注意：售價為「範例佔位價格」，正式上線前請透過後台替換為實際售價與庫存。
'use strict';

const db = require('../lib/db');

const products = [
  {
    slug: 'tombow-mono-air-correction-tape',
    name: 'Tombow MONO AIR 超流暢修正帶',
    brand: '蜻蜓 Tombow',
    category: '修正用品',
    tag: '修正帶',
    price: 139,
    is_bestseller: 1,
    is_ip_collab: 0,
    rank_sold: 1,
    short_desc: '2026 年 1–4 月銷售冠軍・高複購耗材首選',
    description:
      '全得電商 2026 年前四月銷售第一名商品。press-down 滾輪設計，出帶滑順不斷帶，修正一次到位。學生族與上班族的桌面常備款，替帶系列同步在架，長期使用更划算。',
    image: '/images/products/tombow-mono-air-correction-tape.svg',
  },
  {
    slug: 'simbalion-no800-marker',
    name: '雄獅 SIMBALION 超細奇異筆 NO.800',
    brand: '雄獅 SIMBALION',
    category: '筆類',
    tag: '記號筆',
    price: 25,
    is_bestseller: 1,
    is_ip_collab: 0,
    rank_sold: 2,
    short_desc: '全品項銷售第二名・辦公室與居家標記萬用款',
    description:
      '超細筆頭書寫精準，油性速乾不暈染，紙張、紙箱、塑膠表面皆可書寫。辦公室、居家、賣場標價都會用到的國民款奇異筆。',
    image: '/images/products/simbalion-no800-marker.svg',
  },
  {
    slug: 'tombow-mono-air-refill',
    name: 'Tombow MONO AIR 省力修正帶替帶',
    brand: '蜻蜓 Tombow',
    category: '修正用品',
    tag: '修正帶替帶',
    price: 99,
    is_bestseller: 1,
    is_ip_collab: 0,
    rank_sold: 3,
    short_desc: '高複購耗材・搭配 MONO AIR 本體使用',
    description:
      '專為 MONO AIR 系列設計的替換帶，省力機構搭配輕巧換帶設計，是全得後台複購率最高的耗材之一。建議與本體一起加入購物車。',
    image: '/images/products/tombow-mono-air-refill.svg',
  },
  {
    slug: 'oval-meniu-drip-pen',
    name: '歐文 OVAL MENIU DRiP 水滴雙珠鋼珠筆',
    brand: '歐文 OVAL',
    category: '筆類',
    tag: '鋼珠筆',
    price: 59,
    is_bestseller: 1,
    is_ip_collab: 0,
    rank_sold: 4,
    short_desc: '水滴造型雙珠設計・書寫順暢好握',
    description:
      '水滴造型筆身搭配雙珠出墨結構，下筆流暢不斷墨，握感圓潤不易手痠，是學生手帳族與考生的長時間書寫首選。',
    image: '/images/products/oval-meniu-drip-pen.svg',
  },
  {
    slug: 'penrote-6506-ballpoint',
    name: '筆樂 PENROTE 自動原子筆 6506',
    brand: '筆樂 PENROTE',
    category: '筆類',
    tag: '原子筆',
    price: 45,
    is_bestseller: 1,
    is_ip_collab: 0,
    rank_sold: 5,
    short_desc: '經典自動原子筆・耐用平價的桌面常備款',
    description:
      '穩定出墨、按壓機構耐用，是辦公室與居家桌上最容易「隨手就拿到」的一支筆。全得月月穩定熱銷款之一。',
    image: '/images/products/penrote-6506-ballpoint.svg',
  },
  {
    slug: 'pentel-ght-crayon-63',
    name: '飛龍 Pentel 特大粉蠟筆 GHT 63支入',
    brand: '飛龍 Pentel',
    category: '美術用品',
    tag: '粉蠟筆',
    price: 399,
    is_bestseller: 1,
    is_ip_collab: 0,
    rank_sold: 6,
    short_desc: '安全無毒認證・親子族開學季／美術課首選',
    description:
      '63 色一次入手，顏色飽和好上色，安全無毒認證，是暑期美術課與開學季採購爆量的兒童文具明星商品，家長口碑推薦款。',
    image: '/images/products/pentel-ght-crayon-63.svg',
  },
  {
    slug: 'ace-gp4250-gel-pen',
    name: '英士 ACE 笑臉撥動中性筆 GP4250',
    brand: '英士 ACE',
    category: '筆類',
    tag: '中性筆',
    price: 35,
    is_bestseller: 1,
    is_ip_collab: 0,
    rank_sold: 7,
    short_desc: '可愛笑臉撥動設計・學生族最愛的療癒系文具',
    description:
      '撥動式出芯設計搭配笑臉造型，書寫順暢之餘也是桌面上的療癒小物，學生族群社群分享率高的人氣款。',
    image: '/images/products/ace-gp4250-gel-pen.svg',
  },
  {
    slug: 'simbalion-sg005-oil-pen',
    name: '雄獅 SIMBALION 4色中油筆 SG-005',
    brand: '雄獅 SIMBALION',
    category: '筆類',
    tag: '中油筆',
    price: 45,
    is_bestseller: 1,
    is_ip_collab: 0,
    rank_sold: 8,
    short_desc: '一支四色・筆記重點標示超方便',
    description:
      '四色油性筆芯一次滿足，切換顏色不用換筆，是做筆記、改考卷、標重點時的萬用款，辦公族與學生族都愛用。',
    image: '/images/products/simbalion-sg005-oil-pen.svg',
  },
  {
    slug: 'pentel-energel-refill',
    name: '飛龍 Pentel ENERGEL 極速鋼珠替芯',
    brand: '飛龍 Pentel',
    category: '筆蕊',
    tag: '鋼珠筆替芯',
    price: 35,
    is_bestseller: 1,
    is_ip_collab: 0,
    rank_sold: 9,
    short_desc: '高複購耗材・ENERGEL 愛用者必備庫存款',
    description:
      'ENERGEL 系列專用替芯，滑順出墨、速乾不暈，是辦公族回購率最高的耗材類商品，建議搭配本體一起選購並適量囤貨。',
    image: '/images/products/pentel-energel-refill.svg',
  },
  {
    slug: 'tombow-mono-pxn-tape',
    name: '蜻蜓 Tombow MONO PXN 修正帶 CT-PXN',
    brand: '蜻蜓 Tombow',
    category: '修正用品',
    tag: '修正帶',
    price: 120,
    is_bestseller: 1,
    is_ip_collab: 0,
    rank_sold: 10,
    short_desc: '精準修正頭設計・小範圍修正不失手',
    description:
      '窄版精準修正頭，適合小範圍、密集筆記的精確修正，是 MONO AIR 之外的另一款人氣修正帶選擇。',
    image: '/images/products/tombow-mono-pxn-tape.svg',
  },
  // 話題／IP 聯名商品（用於首頁「活動檔期／IP 聯名專區」，對應舊站「限量商品」分類）
  {
    slug: 'tombow-airpress-ballpen',
    name: 'TOMBOW Air Press 氣壓隨寫筆',
    brand: '蜻蜓 Tombow',
    category: '筆類',
    tag: '話題新品',
    price: 180,
    is_bestseller: 0,
    is_ip_collab: 0,
    rank_sold: null,
    short_desc: '倒著寫、躺著寫、濕紙也能寫・雙設計大獎肯定',
    description:
      '按壓筆頂壓縮空氣、強制推出墨水，效果媲美太空筆，卻只要用一般筆芯就能做到。可倒著寫、仰躺著寫，連濕透的紙張都寫得上去。2008 GOOD DESIGN 獎、2010 紅點設計獎雙料肯定，短筆身好攜帶，適合露營、防災包常備。',
    image: '/images/products/tombow-airpress-ballpen.svg',
  },
  {
    slug: 'pilot-chiikawa-correction-tape',
    name: 'PILOT × chiikawa 吉伊卡哇 修正帶聯名款',
    brand: 'PILOT × chiikawa',
    category: '限量商品',
    tag: 'IP 聯名',
    price: 159,
    is_bestseller: 0,
    is_ip_collab: 1,
    rank_sold: null,
    short_desc: '搜尋量是一般商品 1.5–3 倍的話題聯名款',
    description:
      'PILOT 與人氣角色 chiikawa 吉伊卡哇聯名修正帶，可愛角色包裝＋實用修正機構，話題性與實用性兼具，數量有限、售完為止。',
    image: '/images/products/pilot-chiikawa-correction-tape.svg',
  },
  {
    slug: 'zebra-sanrio-sarasa-clip',
    name: 'Zebra × 三麗鷗家族 SARASA CLIP JJ29 0.5mm',
    brand: 'Zebra × 三麗鷗',
    category: '限量商品',
    tag: 'IP 聯名',
    price: 99,
    is_bestseller: 0,
    is_ip_collab: 1,
    rank_sold: null,
    short_desc: '三麗鷗家族角色造型・人氣鋼珠筆聯名款',
    description:
      'Zebra SARASA CLIP 經典鋼珠筆搭配三麗鷗家族角色設計，滑順書寫手感加上可愛外觀，收藏與實用兼具的聯名商品。',
    image: '/images/products/zebra-sanrio-sarasa-clip.svg',
  },
  {
    slug: 'pilot-annasui-frixion',
    name: 'PILOT × ANNA SUI FriXion 新極灰魔擦筆',
    brand: 'PILOT × ANNA SUI',
    category: '限量商品',
    tag: 'IP 聯名',
    price: 139,
    is_bestseller: 0,
    is_ip_collab: 1,
    rank_sold: null,
    short_desc: '時尚聯名設計・可擦拭筆跡書寫更安心',
    description:
      'PILOT FriXion 魔擦筆與時尚品牌 ANNA SUI 聯名款，摩擦生熱即可擦拭筆跡的招牌技術，搭配精緻外觀設計，是送禮與自用的熱門選擇。',
    image: '/images/products/pilot-annasui-frixion.svg',
  },
];

function run() {
  const insert = db.prepare(`
    INSERT INTO products
      (slug, name, brand, category, tag, price, is_bestseller, is_ip_collab, rank_sold, short_desc, description, image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET
      name=excluded.name, brand=excluded.brand, category=excluded.category, tag=excluded.tag,
      price=excluded.price, is_bestseller=excluded.is_bestseller,
      is_ip_collab=excluded.is_ip_collab, rank_sold=excluded.rank_sold,
      short_desc=excluded.short_desc, description=excluded.description,
      image=excluded.image
  `);

  db.prepare('BEGIN').run();
  try {
    for (const p of products) {
      insert.run(
        p.slug, p.name, p.brand, p.category, p.tag, p.price,
        p.is_bestseller, p.is_ip_collab, p.rank_sold,
        p.short_desc, p.description, p.image
      );
    }
    db.prepare('COMMIT').run();
    console.log(`已匯入 / 更新 ${products.length} 筆商品資料。`);
  } catch (err) {
    db.prepare('ROLLBACK').run();
    throw err;
  }
}

if (require.main === module) {
  run();
}

module.exports = { products, run };
