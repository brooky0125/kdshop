// views/products.js
'use strict';

const { escapeHtml, productGrid, money } = require('./components');

function productsPage({ products, categories, activeCategory }) {
  return `
  <section>
    <div class="container">
      <div class="breadcrumb"><a href="/">首頁</a> / 商品</div>
      <div class="section-heading">
        <span class="eyebrow">Products</span>
        <h2>${activeCategory ? escapeHtml(activeCategory) : '全部商品'}</h2>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:32px;">
        <a class="btn ${!activeCategory ? '' : 'outline'} small" href="/products">全部</a>
        ${categories
          .map(
            (c) =>
              `<a class="btn ${activeCategory === c.category ? '' : 'outline'} small" href="/products?category=${encodeURIComponent(
                c.category
              )}">${escapeHtml(c.category)}${c.count ? ` (${c.count})` : ''}</a>`
          )
          .join('\n')}
      </div>
      ${productGrid(products)}
    </div>
  </section>`;
}

function productDetailPage({ product }) {
  return `
  <section>
    <div class="container">
      <div class="breadcrumb"><a href="/">首頁</a> / <a href="/products?category=${encodeURIComponent(
        product.category
      )}">${escapeHtml(product.category)}</a> / ${escapeHtml(product.name)}</div>
      <div class="product-detail">
        <div>
          <img src="${escapeHtml(product.image || '/images/placeholder.svg')}" alt="${escapeHtml(product.name)}" />
        </div>
        <div>
          ${product.rank_sold ? `<span class="badge">熱銷 TOP ${product.rank_sold}</span>` : ''}
          ${product.is_ip_collab ? `<span class="badge gold">IP 聯名</span>` : ''}
          <p style="color:var(--color-text-muted);margin-top:10px;">${escapeHtml(product.brand)} · ${escapeHtml(
    product.category
  )}${product.tag ? ' · ' + escapeHtml(product.tag) : ''}</p>
          <h1>${escapeHtml(product.name)}</h1>
          <p>${escapeHtml(product.short_desc || '')}</p>
          <div class="price">${money(product.price)}</div>
          <p>${escapeHtml(product.description || '')}</p>
          <form class="qty-form" method="POST" action="/cart/add">
            <input type="hidden" name="productId" value="${product.id}" />
            <input type="number" name="quantity" value="1" min="1" max="${Math.max(
              1,
              product.stock
            )}" />
            <button class="btn" type="submit">加入購物車</button>
          </form>
          <p style="font-size:13px;color:var(--color-text-muted);margin-top:8px;">
            ${product.stock > 0 ? `庫存 ${product.stock} 件` : '目前補貨中'}
          </p>
        </div>
      </div>
    </div>
  </section>`;
}

module.exports = { productsPage, productDetailPage };
