// views/admin/layout.js
'use strict';

function adminPage({ title, body, active = '' }) {
  const nav = [
    ['dashboard', '/admin', '儀表板'],
    ['products', '/admin/products', '商品管理'],
    ['banners', '/admin/banners', 'Banner 管理'],
    ['posts', '/admin/posts', '最新消息'],
    ['orders', '/admin/orders', '訂單'],
  ];
  return `<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} | 全得後台</title>
  <link rel="stylesheet" href="/css/styles.css" />
  <link rel="stylesheet" href="/css/admin.css" />
</head>
<body class="admin-body">
  <div class="admin-shell">
    <aside class="admin-sidebar">
      <div class="admin-logo">全得後台</div>
      <nav>
        ${nav
          .map(
            ([key, href, label]) =>
              `<a href="${href}" class="${active === key ? 'active' : ''}">${label}</a>`
          )
          .join('\n')}
      </nav>
      <a href="/admin/logout" class="admin-logout">登出</a>
      <a href="/" class="admin-logout" style="opacity:0.7;">↩ 回前台</a>
    </aside>
    <main class="admin-main">
      ${body}
    </main>
  </div>
</body>
</html>`;
}

module.exports = { adminPage };
