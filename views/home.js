// views/home.js
'use strict';

const { escapeHtml, productCard } = require('./components');

// 範例社群貼文（取材自品牌文案範本，實際上線後由後台「最新消息」內容取代／串接）
const SAMPLE_SOCIAL_POSTS = [
  {
    platform: 'Instagram',
    tag: '[ KD | 好物雷達 ]',
    text: 'TOMBOW Air Press 氣壓隨寫筆，靠按壓筆頂壓縮空氣、把墨水強制推出來，效果像太空筆，卻只要用一般筆芯就能做到。倒著寫、仰躺著寫，連濕透的紙張都寫得上去。',
    tags: '#全得文具 #限定文具 #文具生活 #TOMBOW',
  },
  {
    platform: 'Threads',
    tag: '',
    text: '戶外咖的裝備清單裡都是防水外套、防水包，結果筆記本用的筆一淋雨就報銷🌧️ 這支筆紙濕了照樣寫得清楚，露營記裝備清單、爬山寫行程都不用擔心天氣。',
    tags: '你的登山包裡有備一支「淋雨也能寫」的筆嗎？',
  },
  {
    platform: 'Facebook',
    tag: '📝 新品推薦',
    text: 'TOMBOW MONO AIR 超流暢修正帶——press-down 滾輪設計，出帶滑順不斷帶。2026 年前四月銷售冠軍，學生族、上班族的桌面常備款。',
    tags: '👉 立即選購 → 全得文具電商',
  },
];

function homePage({ bestsellers, ipCollab, banners, categories }) {
  const bannerHtml = banners.length
    ? `<section>
        <div class="container">
          <div class="banner-slider">
            ${banners
              .map(
                (b) => `<a class="banner" style="background-image:url('${escapeHtml(
                  b.image
                )}')" href="${escapeHtml(b.link_url || '#')}">
                  <div class="overlay">
                    <h3>${escapeHtml(b.title)}</h3>
                    <p>${escapeHtml(b.subtitle || '')}</p>
                  </div>
                </a>`
              )
              .join('\n')}
          </div>
        </div>
      </section>`
    : '';

  return `
  <section class="hero">
    <div class="container">
      <span class="eyebrow">KD 全得文具・專業的文具百科全書</span>
      <h1>為認真生活的你，挑選每一支值得的好筆</h1>
      <p>嚴謹選品，提供真實可靠的商品資訊；文具是生活美學，也貼近你我的真實需求——像懂文具的朋友在推薦，不是在打廣告。</p>
      <a class="btn" href="/products">逛逛全部商品</a>
    </div>
  </section>

  ${bannerHtml}

  <section>
    <div class="container">
      <div class="section-heading">
        <span class="eyebrow">Bestsellers</span>
        <h2>明星商品・熱銷榜</h2>
      </div>
      <div class="grid">
        ${bestsellers.map(productCard).join('\n')}
      </div>
    </div>
  </section>

  <section class="alt">
    <div class="container brand-story">
      <div>
        <span class="eyebrow" style="color:var(--color-gold);font-weight:700;">Brand Story</span>
        <h2>全得文具是「專業的文具百科全書」</h2>
        <p>品牌定位：為認真生活的你，挑選每一支值得的好筆。我們相信文具不只是工具，更是生活態度的展現。</p>
        <div class="pillars">
          <div class="pillar"><div class="num">01</div><strong>專業可信</strong><p>嚴謹選品，提供真實可靠的商品資訊，建立長期信任。</p></div>
          <div class="pillar"><div class="num">02</div><strong>精緻有趣</strong><p>文具是生活美學；IP 聯名體現對美的追求與品味。</p></div>
          <div class="pillar"><div class="num">03</div><strong>溫暖親切</strong><p>貼近學生、上班族、家長的真實需求，像懂文具的好朋友。</p></div>
        </div>
        <a class="btn outline" href="/brand-story" style="margin-top:20px;">閱讀完整品牌故事</a>
      </div>
      <div>
        <img src="/images/placeholder.svg" alt="全得文具品牌形象圖" style="width:100%;border-radius:var(--radius);box-shadow:var(--shadow);" />
      </div>
    </div>
  </section>

  ${
    ipCollab.length
      ? `<section>
    <div class="container">
      <div class="section-heading">
        <span class="eyebrow">Campaign / IP Collab</span>
        <h2>活動檔期・IP 聯名專區</h2>
        <p style="color:var(--color-text-muted);max-width:560px;margin:0 auto;">聯名款搜尋量是一般商品的 1.5–3 倍，數量有限、售完為止。</p>
      </div>
      <div class="grid">
        ${ipCollab.map(productCard).join('\n')}
      </div>
    </div>
  </section>`
      : ''
  }

  <section class="alt">
    <div class="container">
      <div class="section-heading">
        <span class="eyebrow">Social</span>
        <h2>社群串接・最新貼文</h2>
      </div>
      <div class="social-grid">
        ${SAMPLE_SOCIAL_POSTS.map(
          (p) => `<div class="social-card">
            <span class="platform">${escapeHtml(p.platform)}</span>
            <p>${p.tag ? `<strong>${escapeHtml(p.tag)}</strong><br/>` : ''}${escapeHtml(p.text)}</p>
            <div class="tags">${escapeHtml(p.tags)}</div>
          </div>`
        ).join('\n')}
      </div>
      <p style="text-align:center;color:var(--color-text-muted);font-size:13px;margin-top:20px;">
        以上為示範內容，正式上線後可於後台「最新消息」串接實際 IG／Threads／FB 貼文。
      </p>
    </div>
  </section>
  `;
}

module.exports = { homePage };
