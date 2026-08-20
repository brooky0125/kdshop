// lib/banners.js
'use strict';

const db = require('./db');

function listActiveBanners() {
  const now = new Date().toISOString();
  return db
    .prepare(
      `SELECT * FROM banners
       WHERE is_active = 1
         AND (starts_at IS NULL OR starts_at <= ?)
         AND (ends_at IS NULL OR ends_at >= ?)
       ORDER BY sort_order ASC, id DESC`
    )
    .all(now, now);
}

function listAllBanners() {
  return db.prepare('SELECT * FROM banners ORDER BY sort_order ASC, id DESC').all();
}

function getBanner(id) {
  return db.prepare('SELECT * FROM banners WHERE id = ?').get(id);
}

function createBanner(data) {
  const info = db
    .prepare(
      `INSERT INTO banners (title, subtitle, image, link_url, is_active, sort_order, starts_at, ends_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      data.title,
      data.subtitle || '',
      data.image,
      data.link_url || '',
      data.is_active ? 1 : 0,
      Number(data.sort_order) || 0,
      data.starts_at || null,
      data.ends_at || null
    );
  return info.lastInsertRowid;
}

function updateBanner(id, data) {
  db.prepare(
    `UPDATE banners SET
      title = ?, subtitle = ?, image = COALESCE(?, image), link_url = ?,
      is_active = ?, sort_order = ?, starts_at = ?, ends_at = ?
     WHERE id = ?`
  ).run(
    data.title,
    data.subtitle || '',
    data.image || null,
    data.link_url || '',
    data.is_active ? 1 : 0,
    Number(data.sort_order) || 0,
    data.starts_at || null,
    data.ends_at || null,
    id
  );
}

function deleteBanner(id) {
  db.prepare('DELETE FROM banners WHERE id = ?').run(id);
}

module.exports = {
  listActiveBanners,
  listAllBanners,
  getBanner,
  createBanner,
  updateBanner,
  deleteBanner,
};
