// lib/cart.js
// 購物車邏輯：以 cookie 內的 cart_id 對應 SQLite 裡的 carts / cart_items
'use strict';

const crypto = require('crypto');
const db = require('./db');

function createCart() {
  const id = crypto.randomUUID();
  db.prepare('INSERT INTO carts (id) VALUES (?)').run(id);
  return id;
}

function ensureCart(cartId) {
  if (cartId) {
    const row = db.prepare('SELECT id FROM carts WHERE id = ?').get(cartId);
    if (row) return cartId;
  }
  return createCart();
}

function addItem(cartId, productId, quantity = 1) {
  const existing = db
    .prepare('SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?')
    .get(cartId, productId);
  if (existing) {
    db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(
      existing.quantity + quantity,
      existing.id
    );
  } else {
    db.prepare('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)').run(
      cartId,
      productId,
      quantity
    );
  }
}

function updateItem(cartId, productId, quantity) {
  if (quantity <= 0) {
    removeItem(cartId, productId);
    return;
  }
  db.prepare('UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?').run(
    quantity,
    cartId,
    productId
  );
}

function removeItem(cartId, productId) {
  db.prepare('DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?').run(cartId, productId);
}

function clearCart(cartId) {
  db.prepare('DELETE FROM cart_items WHERE cart_id = ?').run(cartId);
}

function getCartItems(cartId) {
  return db
    .prepare(
      `SELECT ci.product_id as productId, ci.quantity, p.name, p.slug, p.price, p.image, p.brand
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.cart_id = ?
       ORDER BY ci.id ASC`
    )
    .all(cartId);
}

function getCartSummary(cartId) {
  const items = getCartItems(cartId);
  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = items.reduce((sum, i) => sum + i.quantity * i.price, 0);
  return { items, totalQuantity, totalAmount };
}

module.exports = {
  createCart,
  ensureCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  getCartItems,
  getCartSummary,
};
