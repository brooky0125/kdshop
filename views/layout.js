// views/layout.js
// 前台共用版型（暫時版面，等 Figma 設計稿定案後會重做這份，不影響下面頁面呼叫的方式）
'use strict';

const { escapeHtml } = require('../lib/http-utils');

function baseHead(title) {
  return `<meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)} | 全得文具 KD</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&family=Noto+Serif+TC:wght@600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/styles.css" />`;
}

function header({ cartCount = 0, customer = null } = {}) {
  return `<header class="site-header">
    <div class="container">
      <a class="logo" href="/">全得文具 KD</a>
      <nav>
        <a href="/">首頁</a>
        <a href="/brand-story">品牌故事</a>
        <a href="/products">商品</a>
        <a href="/news">最新消息</a>
        ${
          customer
            ? `<a href="/account">我的帳戶</a><a href="/account/logout">登出</a>`
            : `<a href="/login">會員登入</a>`
        }
        <a class="cart-link" href="/cart">購物車 ${cartCount > 0 ? `(${cartCount})` : ''}</a>
      </nav>
    </div>
  </header>`;
}

function footer() {
  return `<footer class="site-footer">
    <div class="container">
      <p>KD 全得・綜合企業有限公司　|　關於全得　|　購物流程　|　付款說明　|　退換貨政策　|　隱私權政策　|　客服中心</p>
      <p>© ${new Date().getFullYear()} Quande Stationery. 本網站為品牌形象與電商原型示範站。</p>
    </div>
  </footer>`;
}

function page({ title, body, cartCount = 0, customer = null }) {
  return `<!doctype html>
<html lang="zh-Hant">
<head>
  ${baseHead(title)}
</head>
<body>
  ${header({ cartCount, customer })}
  ${body}
  ${footer()}
  <script src="/js/main.js"></script>
</body>
</html>`;
}

module.exports = { page, baseHead, header, footer };
