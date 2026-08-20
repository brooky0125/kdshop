// lib/customers.js
// 會員（前台顧客）帳號：註冊／登入／個人資料／歷史訂單
'use strict';

const db = require('./db');
const { hashPassword, verifyPassword } = require('./auth');

function findByEmail(email) {
  return db.prepare('SELECT * FROM customers WHERE email = ?').get(String(email).toLowerCase());
}

function getById(id) {
  return db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
}

function register({ email, password, name, phone, address }) {
  const normalizedEmail = String(email).toLowerCase().trim();
  if (findByEmail(normalizedEmail)) {
    const err = new Error('EMAIL_TAKEN');
    err.code = 'EMAIL_TAKEN';
    throw err;
  }
  const { hash, salt } = hashPassword(password);
  const info = db
    .prepare(
      `INSERT INTO customers (email, password_hash, password_salt, name, phone, address)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(normalizedEmail, hash, salt, name || '', phone || '', address || '');
  return info.lastInsertRowid;
}

function login(email, password) {
  const customer = findByEmail(email);
  if (!customer) return null;
  const ok = verifyPassword(password, customer.password_salt, customer.password_hash);
  return ok ? customer : null;
}

function updateProfile(id, { name, phone, address }) {
  db.prepare('UPDATE customers SET name = ?, phone = ?, address = ? WHERE id = ?').run(
    name || '',
    phone || '',
    address || '',
    id
  );
}

function getOrderHistory(customerId) {
  const orders = db
    .prepare(
      `SELECT id, merchant_trade_no as tradeNo, total_amount as totalAmount, status, created_at as createdAt
       FROM orders WHERE customer_id = ? ORDER BY id DESC`
    )
    .all(customerId);
  const itemsStmt = db.prepare('SELECT * FROM order_items WHERE order_id = ?');
  return orders.map((o) => ({ ...o, items: itemsStmt.all(o.id) }));
}

// 供未來從舊 ASP 網站匯入會員資料使用：以 legacy_member_no 對應舊帳號，
// email 已存在則略過（避免重複匯入）。密碼會先給一組隨機碼，
// 並建議請舊會員用「忘記密碼」流程重新設定（因為舊系統的密碼雜湊格式通常不相容）。
function importLegacyCustomer({ email, legacyMemberNo, name, phone, address }) {
  const normalizedEmail = String(email).toLowerCase().trim();
  if (findByEmail(normalizedEmail)) return { skipped: true, reason: 'EMAIL_EXISTS' };
  const tempPassword = require('crypto').randomBytes(9).toString('base64url');
  const { hash, salt } = hashPassword(tempPassword);
  db.prepare(
    `INSERT INTO customers (email, password_hash, password_salt, name, phone, address, legacy_member_no)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(normalizedEmail, hash, salt, name || '', phone || '', address || '', legacyMemberNo || null);
  return { skipped: false };
}

module.exports = {
  findByEmail,
  getById,
  register,
  login,
  updateProfile,
  getOrderHistory,
  importLegacyCustomer,
};
