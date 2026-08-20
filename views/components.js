// views/components.js
'use strict';

const { escapeHtml } = require('../lib/http-utils');

function money(n) {
  return `NT$${Number(n).toLocaleString('zh-Hant-TW')}`;
}

function productCard(p) {
  return `<a class="card" href="/products/${encodeURIComponent(p.slug)}">
    <img src="${escapeHtml(p.image || '/images/placeholder.svg')}" alt="${escapeHtml(p.name)}" loading="lazy" />
    <div class="card-body">
      ${p.rank_sold ? `<span class="badge">熱銷 TOP ${p.rank_sold}</span>` : ''}
      ${p.is_ip_collab ? `<span class="badge gold">IP 聯名</span>` : ''}
      <span class="brand">${escapeHtml(p.brand)}</span>
      <span class="name">${escapeHtml(p.name)}</span>
      <span class="price">${money(p.price)}</span>
    </div>
  </a>`;
}

function productGrid(products) {
  if (!products.length) {
    return `<div class="empty-state">目前這個分類還沒有商品，後台新增後會顯示在這裡。</div>`;
  }
  return `<div class="grid">${products.map(productCard).join('\n')}</div>`;
}

module.exports = { money, productCard, productGrid, escapeHtml };
