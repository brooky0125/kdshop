// views/account.js
'use strict';

const { escapeHtml, money } = require('./components');

function loginPage({ error } = {}) {
  return `<section><div class="container">
    <h1>會員登入</h1>
    ${error ? `<div class="flash" style="background:#f7d6d6;">${escapeHtml(error)}</div>` : ''}
    <form class="form-box" method="POST" action="/login">
      <label>Email<input type="email" name="email" required /></label>
      <label>密碼<input type="password" name="password" required /></label>
      <button class="btn" type="submit" style="width:100%;">登入</button>
    </form>
    <p style="margin-top:16px;">還不是會員？ <a href="/register" style="color:var(--color-primary);font-weight:700;">立即註冊</a></p>
    <p style="margin-top:8px;color:var(--color-text-muted);font-size:13px;">也可以不登入，直接以訪客身分結帳。</p>
  </div></section>`;
}

function registerPage({ error } = {}) {
  return `<section><div class="container">
    <h1>加入會員</h1>
    ${error ? `<div class="flash" style="background:#f7d6d6;">${escapeHtml(error)}</div>` : ''}
    <form class="form-box" method="POST" action="/register">
      <label>姓名<input type="text" name="name" required /></label>
      <label>Email<input type="email" name="email" required /></label>
      <label>密碼（至少 8 碼）<input type="password" name="password" minlength="8" required /></label>
      <label>手機<input type="tel" name="phone" /></label>
      <label>常用收件地址<textarea name="address" rows="2"></textarea></label>
      <button class="btn" type="submit" style="width:100%;">建立帳號</button>
    </form>
  </div></section>`;
}

function accountPage({ customer, orders }) {
  return `<section><div class="container">
    <h1>我的帳戶</h1>
    <div class="card" style="padding:20px;max-width:480px;margin-bottom:32px;">
      <p><strong>${escapeHtml(customer.name || '')}</strong></p>
      <p style="color:var(--color-text-muted);">${escapeHtml(customer.email)}</p>
      <p>${escapeHtml(customer.phone || '（尚未填寫電話）')}</p>
      <p>${escapeHtml(customer.address || '（尚未填寫地址）')}</p>
    </div>
    <h2>歷史訂單</h2>
    ${
      orders.length
        ? `<table class="data-table">
        <thead><tr><th>訂單編號</th><th>日期</th><th>金額</th><th>狀態</th></tr></thead>
        <tbody>
          ${orders
            .map(
              (o) => `<tr>
              <td><a href="/checkout/result?trade_no=${escapeHtml(o.tradeNo)}">${escapeHtml(o.tradeNo)}</a></td>
              <td>${new Date(o.createdAt).toLocaleDateString('zh-Hant-TW')}</td>
              <td>${money(o.totalAmount)}</td>
              <td>${escapeHtml({ paid: '已付款', pending: '處理中', failed: '失敗' }[o.status] || o.status)}</td>
            </tr>`
            )
            .join('\n')}
        </tbody>
      </table>`
        : `<p style="color:var(--color-text-muted);">還沒有訂單紀錄。</p>`
    }
  </div></section>`;
}

module.exports = { loginPage, registerPage, accountPage };
