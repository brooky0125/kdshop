// views/admin/orders.js
'use strict';

const { adminPage } = require('./layout');
const { escapeHtml, money } = require('../components');

function ordersListView({ orders }) {
  const body = `
    <div class="admin-topbar"><h1>訂單列表</h1></div>
    <table class="admin-table">
      <thead><tr><th>訂單編號</th><th>客戶</th><th>電話</th><th>金額</th><th>狀態</th><th>建立時間</th></tr></thead>
      <tbody>
        ${orders
          .map(
            (o) => `<tr>
            <td>${escapeHtml(o.merchant_trade_no)}</td>
            <td>${escapeHtml(o.customer_name || '')}</td>
            <td>${escapeHtml(o.customer_phone || '')}</td>
            <td>${money(o.total_amount)}</td>
            <td>${escapeHtml({ paid: '已付款', pending: '處理中', failed: '失敗' }[o.status] || o.status)}</td>
            <td>${new Date(o.created_at).toLocaleString('zh-Hant-TW')}</td>
          </tr>`
          )
          .join('\n')}
      </tbody>
    </table>
  `;
  return adminPage({ title: '訂單', body, active: 'orders' });
}

module.exports = { ordersListView };
