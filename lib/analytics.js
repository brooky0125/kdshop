// lib/analytics.js
// 後台儀表板用的統計查詢
'use strict';

const db = require('./db');

function getSummary() {
  const totals = db
    .prepare(
      `SELECT
        COUNT(*) as orderCount,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END), 0) as paidRevenue,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END), 0) as paidCount,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) as pendingCount,
        COALESCE(SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END), 0) as failedCount
      FROM orders`
    )
    .get();

  const last7days = db
    .prepare(
      `SELECT date(created_at) as day, COUNT(*) as orders,
              COALESCE(SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END), 0) as revenue
       FROM orders
       WHERE created_at >= datetime('now', '-7 days')
       GROUP BY date(created_at)
       ORDER BY day ASC`
    )
    .all();

  const topProducts = db
    .prepare(
      `SELECT oi.product_name as name, SUM(oi.quantity) as totalQty,
              SUM(oi.quantity * oi.unit_price) as totalRevenue
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE o.status = 'paid'
       GROUP BY oi.product_name
       ORDER BY totalQty DESC
       LIMIT 5`
    )
    .all();

  const recentOrders = db
    .prepare(
      `SELECT merchant_trade_no as tradeNo, customer_name as customerName,
              total_amount as totalAmount, status, created_at as createdAt
       FROM orders
       ORDER BY id DESC
       LIMIT 20`
    )
    .all();

  return { totals, last7days, topProducts, recentOrders };
}

module.exports = { getSummary };
