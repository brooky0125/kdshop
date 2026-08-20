// lib/orders.js
'use strict';

const db = require('./db');
const { genMerchantTradeNo } = require('./ecpay');

function createOrder({ cartId, items, totalAmount, customer, customerId }) {
  const merchantTradeNo = genMerchantTradeNo();
  const info = db
    .prepare(
      `INSERT INTO orders
        (merchant_trade_no, cart_id, customer_id, customer_name, customer_phone, customer_email, shipping_address, total_amount, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`
    )
    .run(
      merchantTradeNo,
      cartId,
      customerId || null,
      customer.name,
      customer.phone,
      customer.email,
      customer.address,
      totalAmount
    );

  const orderId = info.lastInsertRowid;
  const insertItem = db.prepare(
    `INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity)
     VALUES (?, ?, ?, ?, ?)`
  );
  for (const item of items) {
    insertItem.run(orderId, item.productId, item.name, item.price, item.quantity);
  }

  return { orderId, merchantTradeNo };
}

function getOrderByTradeNo(merchantTradeNo) {
  const order = db.prepare('SELECT * FROM orders WHERE merchant_trade_no = ?').get(merchantTradeNo);
  if (!order) return null;
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  return { ...order, items };
}

function markOrderPaid(merchantTradeNo, { ecpayTradeNo, payload }) {
  db.prepare(
    `UPDATE orders SET status = 'paid', ecpay_trade_no = ?, ecpay_payload = ?, paid_at = CURRENT_TIMESTAMP
     WHERE merchant_trade_no = ?`
  ).run(ecpayTradeNo, JSON.stringify(payload), merchantTradeNo);
}

function markOrderFailed(merchantTradeNo, payload) {
  db.prepare(
    `UPDATE orders SET status = 'failed', ecpay_payload = ? WHERE merchant_trade_no = ?`
  ).run(JSON.stringify(payload), merchantTradeNo);
}

function listAllOrders(limit = 200) {
  return db.prepare('SELECT * FROM orders ORDER BY id DESC LIMIT ?').all(limit);
}

module.exports = {
  createOrder,
  getOrderByTradeNo,
  markOrderPaid,
  markOrderFailed,
  listAllOrders,
};
