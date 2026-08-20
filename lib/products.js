// lib/products.js
'use strict';

const db = require('./db');
const { CATEGORIES } = require('./categories');

function listProducts({ category } = {}) {
  if (category) {
    return db
      .prepare('SELECT * FROM products WHERE category = ? ORDER BY rank_sold IS NULL, rank_sold ASC')
      .all(category);
  }
  return db.prepare('SELECT * FROM products ORDER BY rank_sold IS NULL, rank_sold ASC').all();
}

function listBestsellers(limit = 10) {
  return db
    .prepare('SELECT * FROM products WHERE is_bestseller = 1 ORDER BY rank_sold ASC LIMIT ?')
    .all(limit);
}

function listIpCollab() {
  return db.prepare('SELECT * FROM products WHERE is_ip_collab = 1').all();
}

function listCategories() {
  const counts = db
    .prepare('SELECT category, COUNT(*) as count FROM products GROUP BY category')
    .all();
  const countMap = Object.fromEntries(counts.map((c) => [c.category, c.count]));
  // 依照 CATEGORIES 固定順序回傳（沿用舊站分類架構），沒有商品的分類 count 為 0
  return CATEGORIES.map((name) => ({ category: name, count: countMap[name] || 0 }));
}

function getBySlug(slug) {
  return db.prepare('SELECT * FROM products WHERE slug = ?').get(slug);
}

function getById(id) {
  return db.prepare('SELECT * FROM products WHERE id = ?').get(id);
}

function slugify(name) {
  return (
    String(name)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9一-鿿]+/g, '-')
      .replace(/^-+|-+$/g, '') || `product-${Date.now()}`
  );
}

function createProduct(data) {
  let slug = data.slug || slugify(data.name);
  // 確保 slug 唯一
  let uniqueSlug = slug;
  let i = 1;
  while (db.prepare('SELECT id FROM products WHERE slug = ?').get(uniqueSlug)) {
    uniqueSlug = `${slug}-${i++}`;
  }

  const info = db
    .prepare(
      `INSERT INTO products
        (slug, name, brand, category, tag, price, stock, is_bestseller, is_ip_collab, rank_sold, short_desc, description, image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      uniqueSlug,
      data.name,
      data.brand || '',
      data.category || CATEGORIES[0],
      data.tag || '',
      Number(data.price) || 0,
      Number(data.stock) || 0,
      data.is_bestseller ? 1 : 0,
      data.is_ip_collab ? 1 : 0,
      data.rank_sold || null,
      data.short_desc || '',
      data.description || '',
      data.image || '/images/placeholder.svg'
    );
  return info.lastInsertRowid;
}

function updateProduct(id, data) {
  db.prepare(
    `UPDATE products SET
      name = ?, brand = ?, category = ?, tag = ?, price = ?, stock = ?,
      is_bestseller = ?, is_ip_collab = ?, rank_sold = ?,
      short_desc = ?, description = ?, image = COALESCE(?, image)
     WHERE id = ?`
  ).run(
    data.name,
    data.brand || '',
    data.category || CATEGORIES[0],
    data.tag || '',
    Number(data.price) || 0,
    Number(data.stock) || 0,
    data.is_bestseller ? 1 : 0,
    data.is_ip_collab ? 1 : 0,
    data.rank_sold || null,
    data.short_desc || '',
    data.description || '',
    data.image || null,
    id
  );
}

function deleteProduct(id) {
  db.prepare('DELETE FROM products WHERE id = ?').run(id);
}

module.exports = {
  listProducts,
  listBestsellers,
  listIpCollab,
  listCategories,
  getBySlug,
  getById,
  createProduct,
  updateProduct,
  deleteProduct,
  slugify,
};
