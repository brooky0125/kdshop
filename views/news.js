// views/news.js
'use strict';

const { escapeHtml } = require('./components');

function newsListPage({ posts }) {
  if (!posts.length) {
    return `<section><div class="container">
      <div class="empty-state">
        <h2>目前還沒有最新消息</h2>
        <p>後台新增文章後會顯示在這裡。</p>
      </div>
    </div></section>`;
  }
  return `<section><div class="container">
    <div class="breadcrumb"><a href="/">首頁</a> / 最新消息</div>
    <div class="section-heading"><span class="eyebrow">News</span><h2>最新消息・社群動態</h2></div>
    <div class="social-grid">
      ${posts
        .map(
          (p) => `<a class="social-card" href="/news/${escapeHtml(p.slug)}" style="display:block;color:inherit;">
            <span class="platform">${escapeHtml(p.platform || '公告')}</span>
            <h3 style="margin:6px 0;">${escapeHtml(p.title)}</h3>
            <p>${escapeHtml(p.excerpt || '')}</p>
            <div class="tags">${new Date(p.published_at).toLocaleDateString('zh-Hant-TW')}</div>
          </a>`
        )
        .join('\n')}
    </div>
  </div></section>`;
}

function newsDetailPage({ post }) {
  return `<section><div class="container" style="max-width:720px;">
    <div class="breadcrumb"><a href="/">首頁</a> / <a href="/news">最新消息</a> / ${escapeHtml(post.title)}</div>
    <span class="platform" style="display:inline-block;font-size:11px;font-weight:700;color:var(--color-primary);background:var(--color-bg-alt);padding:3px 10px;border-radius:999px;">${escapeHtml(
      post.platform || '公告'
    )}</span>
    <h1>${escapeHtml(post.title)}</h1>
    <p style="color:var(--color-text-muted);">${new Date(post.published_at).toLocaleDateString('zh-Hant-TW')}</p>
    ${post.cover_image ? `<img src="${escapeHtml(post.cover_image)}" alt="${escapeHtml(post.title)}" style="width:100%;border-radius:var(--radius);margin:16px 0;" />` : ''}
    <div style="white-space:pre-wrap;">${escapeHtml(post.body || post.excerpt || '')}</div>
  </div></section>`;
}

module.exports = { newsListPage, newsDetailPage };
