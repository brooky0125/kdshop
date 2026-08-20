// views/admin/dashboard.js
'use strict';

const { adminPage } = require('./layout');
const { escapeHtml, money } = require('../components');

function dashboardView({ summary }) {
  const { totals, topProducts, recentOrders } = summary;
  const body = `
    <div class="admin-topbar"><h1>營運儀表板</h1></div>
    <div class="stat-cards">
      <div class="stat-card"><div class="label">累計訂單數</div><div class="value">${totals.orderCount}</div></div>
      <div class="stat-card"><div class="label">已付款訂單</div><div class="value">${totals.paidCount}</div></div>
      <div class="stat-card"><div class="label">已付款營收</div><div class="value">${money(totals.paidRevenue)}</div></div>
      <div class="stat-card"><div class="label">待付款 / 失敗</div><div class="value">${totals.pendingCount} / ${totals.failedCount}</div></div>
    </div>

    <h2>熱銷商品 TOP 5（依已付款訂單）</h2>
    <table class="admin-table">
      <thead><tr><th>商品</th><th>銷售數量</th><th>營收</th></tr></thead>
      <tbody>
        ${
          topProducts.length
            ? topProducts
                .map((p) => `<tr><td>${escapeHtml(p.name)}</td><td>${p.totalQty}</td><td>${money(p.totalRevenue)}</td></tr>`)
                .join('\n')
            : `<tr><td colspan="3">尚無已付款訂單資料</td></tr>`
        }
      </tbody>
    </table>

    <h2>最近訂單</h2>
    <table class="admin-table">
      <thead><tr><th>訂單編號</th><th>客戶</th><th>金額</th><th>狀態</th><th>時間</th></tr></thead>
      <tbody>
        ${
          recentOrders.length
            ? recentOrders
                .map(
                  (o) => `<tr>
                  <td>${escapeHtml(o.tradeNo)}</td>
                  <td>${escapeHtml(o.customerName || '')}</td>
                  <td>${money(o.totalAmount)}</td>
                  <td>${escapeHtml({ paid: '已付款', pending: '處理中', failed: '失敗' }[o.status] || o.status)}</td>
                  <td>${new Date(o.createdAt).toLocaleString('zh-Hant-TW')}</td>
                </tr>`
                )
                .join('\n')
            : `<tr><td colspan="5">尚無訂單</td></tr>`
        }
      </tbody>
    </table>
  `;
  return adminPage({ title: '儀表板', body, active: 'dashboard' });
}

module.exports = { dashboardView };
