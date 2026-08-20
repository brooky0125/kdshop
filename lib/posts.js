// lib/posts.js
// 「最新消息／社群動態」內容管理（後台可新增公告、精選社群貼文）
'use strict';

const db = require('./db');

function slugify(title) {
  return (
    String(title)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9一-鿿]+/g, '-')
      .replace(/^-+|-+$/g, '') || `post-${Date.now()}`
  );
}

function listPublished(limit = 20) {
  return db
    .prepare('SELECT * FROM posts WHERE is_published = 1 ORDER BY published_at DESC LIMIT ?')
    .all(limit);
}

function listAll() {
  return db.prepare('SELECT * FROM posts ORDER BY published_at DESC').all();
}

function getBySlug(slug) {
  return db.prepare('SELECT * FROM posts WHERE slug = ?').get(slug);
}

function getById(id) {
  return db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
}

function createPost(data) {
  let slug = slugify(data.title);
  let unique = slug;
  let i = 1;
  while (db.prepare('SELECT id FROM posts WHERE slug = ?').get(unique)) unique = `${slug}-${i++}`;
  const info = db
    .prepare(
      `INSERT INTO posts (slug, title, platform, excerpt, body, cover_image, is_published, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      unique,
      data.title,
      data.platform || '公告',
      data.excerpt || '',
      data.body || '',
      data.cover_image || null,
      data.is_published ? 1 : 0,
      data.published_at || new Date().toISOString()
    );
  return info.lastInsertRowid;
}

function updatePost(id, data) {
  db.prepare(
    `UPDATE posts SET title=?, platform=?, excerpt=?, body=?, cover_image=COALESCE(?, cover_image),
      is_published=?, published_at=? WHERE id=?`
  ).run(
    data.title,
    data.platform || '公告',
    data.excerpt || '',
    data.body || '',
    data.cover_image || null,
    data.is_published ? 1 : 0,
    data.published_at || new Date().toISOString(),
    id
  );
}

function deletePost(id) {
  db.prepare('DELETE FROM posts WHERE id = ?').run(id);
}

module.exports = { listPublished, listAll, getBySlug, getById, createPost, updatePost, deletePost, slugify };
