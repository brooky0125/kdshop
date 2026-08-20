// views/checkout.js
'use strict';

const { escapeHtml, money } = require('./components');

function checkoutPage({ items, totalAmount, customer, error }) {
  return `<section><div class="container">
    <h1>結帳</h1>
    ${error ? `<div class="flash" style="background:#f7d6d6;">${escapeHtml(error)}</div>` : ''}
    <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:32px;align-items:start;">
      <form class="form-box" method="POST" action="/checkout">
        <label>收件人姓名
          <input type="text" name="name" required value="${escapeHtml(customer?.name || '')}" />
        </label>
        <label>聯絡電話
          <input type="tel" name="phone" required value="${escapeHtml(customer?.phone || '')}" />
        </label>
        <label>Email
          <input type="email" name="email" required value="${escapeHtml(customer?.email || '')}" />
        </label>
        <label>收件地址
          <textarea name="address" rows="3" required>${escapeHtml(customer?.address || '')}</textarea>
        </label>
        <label>付款方式
          <select name="paymentNote">
            <option>信用卡 / ATM / 超商代碼（於下一步的綠界付款頁選擇）</option>
          </select>
        </label>
        <button class="btn" type="submit" style="width:100%;margin-top:10px;">送出訂單並前往付款</button>
      </form>
      <div class="card" style="padding:20px;">
        <h3>訂單明細</h3>
        ${items
          .map(
            (i) =>
              `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--color-bg-alt);font-size:14px;">
                <span>${escapeHtml(i.name)} × ${i.quantity}</span><span>${money(i.price * i.quantity)}</span>
              </div>`
          )
          .join('\n')}
        <div style="display:flex;justify-content:space-between;margin-top:14px;font-weight:700;font-size:18px;color:var(--color-primary);">
          <span>總計</span><span>${money(totalAmount)}</span>
        </div>
      </div>
    </div>
  </div></section>`;
}

// 自動送出至綠界 ECPay 付款頁（AioCheckOut）的隱藏表單頁面
function ecpayRedirectPage({ aioCheckoutUrl, params }) {
  const inputs = Object.entries(params)
    .map(([k, v]) => `<input type="hidden" name="${escapeHtml(k)}" value="${escapeHtml(v)}" />`)
    .join('\n');
  return `<!doctype html>
<html lang="zh-Hant"><head><meta charset="utf-8" /><title>正在前往付款頁面...</title></head>
<body>
  <p style="font-family:sans-serif;text-align:center;margin-top:80px;">正在前往綠界金流付款頁面，請稍候...</p>
  <form id="ecpay-form" method="POST" action="${escapeHtml(aioCheckoutUrl)}">
    ${inputs}
  </form>
  <script>document.getElementById('ecpay-form').submit();</script>
</body></html>`;
}

function checkoutResultPage({ order }) {
  const statusText = { paid: '付款成功', pending: '付款處理中', failed: '付款失敗' }[order.status] || order.status;
  return `<section><div class="container">
    <div class="empty-state">
      <h2>訂單 ${escapeHtml(order.merchant_trade_no)}</h2>
      <p style="font-size:18px;">狀態：<strong>${escapeHtml(statusText)}</strong></p>
      <p>總金額：${money(order.total_amount)}</p>
      ${
        order.status === 'pending'
          ? `<p style="color:var(--color-text-muted);">若已完成付款，狀態可能需要幾秒鐘才會更新，請稍後重新整理此頁。</p>`
          : ''
      }
      <a class="btn" href="/products" style="margin-top:20px;">繼續購物</a>
    </div>
  </div></section>`;
}

module.exports = { checkoutPage, ecpayRedirectPage, checkoutResultPage };
