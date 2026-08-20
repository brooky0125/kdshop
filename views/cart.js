// views/cart.js
'use strict';

const { escapeHtml, money } = require('./components');

function cartPage({ items, totalAmount }) {
  if (!items.length) {
    return `<section><div class="container">
      <div class="empty-state">
        <h2>購物車是空的</h2>
        <p>去逛逛全得的商品吧！</p>
        <a class="btn" href="/products">前往購物</a>
      </div>
    </div></section>`;
  }

  return `<section><div class="container">
    <h1>購物車</h1>
    ${items
      .map(
        (i) => `<div class="cart-row">
        <img src="${escapeHtml(i.image || '/images/placeholder.svg')}" alt="${escapeHtml(i.name)}" />
        <div>
          <a href="/products/${escapeHtml(i.slug)}"><strong>${escapeHtml(i.name)}</strong></a>
          <div style="color:var(--color-text-muted);font-size:13px;">${escapeHtml(i.brand)} · ${money(i.price)}</div>
        </div>
        <form method="POST" action="/cart/update" style="display:flex;gap:6px;align-items:center;">
          <input type="hidden" name="productId" value="${i.productId}" />
          <input type="number" name="quantity" value="${i.quantity}" min="1" style="width:60px;padding:6px;border-radius:6px;border:1px solid #ddd;" />
          <button class="btn outline small" type="submit">更新</button>
        </form>
        <div><strong>${money(i.price * i.quantity)}</strong></div>
        <form method="POST" action="/cart/remove">
          <input type="hidden" name="productId" value="${i.productId}" />
          <button class="btn danger small" type="submit">移除</button>
        </form>
      </div>`
      )
      .join('\n')}
    <div class="cart-summary">
      <div class="total">總計 ${money(totalAmount)}</div>
      <a class="btn" href="/checkout" style="margin-top:14px;">前往結帳</a>
    </div>
  </div></section>`;
}

module.exports = { cartPage };
