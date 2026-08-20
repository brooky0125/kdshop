// views/admin/auth.js
'use strict';

const { escapeHtml } = require('../components');

function setupPage({ error } = {}) {
  return `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"/><title>後台初始設定</title>
  <link rel="stylesheet" href="/css/admin.css" /></head>
  <body class="admin-body"><div class="admin-login-wrap">
    <div class="admin-form" style="width:360px;">
      <h2>建立後台管理員帳號</h2>
      <p style="font-size:13px;color:#5b6259;">第一次使用後台，請先建立管理員帳號。之後可以在伺服器環境變數設定 ADMIN_SESSION_SECRET 來保護登入 session。</p>
      ${error ? `<div class="admin-flash">${escapeHtml(error)}</div>` : ''}
      <form method="POST" action="/admin/setup">
        <label>帳號<input type="text" name="username" required /></label>
        <label>密碼（至少 8 碼）<input type="password" name="password" minlength="8" required /></label>
        <button class="btn" type="submit" style="width:100%;">建立帳號並登入</button>
      </form>
    </div>
  </div></body></html>`;
}

function loginPage({ error } = {}) {
  return `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"/><title>後台登入</title>
  <link rel="stylesheet" href="/css/admin.css" /></head>
  <body class="admin-body"><div class="admin-login-wrap">
    <div class="admin-form" style="width:340px;">
      <h2>全得後台登入</h2>
      ${error ? `<div class="admin-flash">${escapeHtml(error)}</div>` : ''}
      <form method="POST" action="/admin/login">
        <label>帳號<input type="text" name="username" required /></label>
        <label>密碼<input type="password" name="password" required /></label>
        <button class="btn" type="submit" style="width:100%;">登入</button>
      </form>
    </div>
  </div></body></html>`;
}

module.exports = { setupPage, loginPage };
