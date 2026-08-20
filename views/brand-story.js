// views/brand-story.js
'use strict';

function brandStoryPage() {
  return `<section><div class="container" style="max-width:760px;">
    <div class="breadcrumb"><a href="/">首頁</a> / 品牌故事</div>
    <span class="eyebrow" style="color:var(--color-gold);font-weight:700;">Brand Identity &amp; Tone</span>
    <h1>全得文具是「專業的文具百科全書」</h1>
    <p>品牌定位：為認真生活的你，挑選每一支值得的好筆。當全得開口說話，它不是廣告口吻，而是像一位懂文具的朋友，把真正好用的東西介紹給你。</p>

    <div class="pillars" style="grid-template-columns:1fr;margin:32px 0;">
      <div class="pillar"><div class="num">01 專業可信</div><p>嚴謹選品，提供真實可靠的商品資訊，建立長期信任。我們不誇大、不空口說白話，每一支推薦的筆都經得起長期使用的檢驗。</p></div>
      <div class="pillar"><div class="num">02 精緻有趣</div><p>文具是生活美學的一部分；IP 聯名體現的是對美的追求與品味，而不只是話題操作。</p></div>
      <div class="pillar"><div class="num">03 溫暖親切</div><p>貼近學生、上班族、家長的真實需求——用「你」不用「您」，口語不官腔，像好朋友一樣分享真實使用心得。</p></div>
    </div>

    <h2>說話像朋友，不說話像廣告</h2>
    <p>我們相信「用了 3 個月，筆跡還是一樣滑」這樣有根據的熱情，比「超級優惠！限時大特賣！！！」更能打動真正在乎文具的人。</p>

    <h2>視覺語言：一眼認出全得風格</h2>
    <p>主色墨綠、輔色鉛筆黃，點綴薄荷綠與暖金黃，貫穿所有頁面與貼文版面。攝影風格以平鋪俯拍（Flat Lay）與書寫特寫為主，自然光、暖色調，讓人一眼就能認出「這是全得」。</p>
  </div></section>`;
}

module.exports = { brandStoryPage };
