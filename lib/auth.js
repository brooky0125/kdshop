// lib/auth.js
// 後台登入驗證：密碼用 scrypt 雜湊儲存，登入後用簽章 cookie（HMAC）維持 session。
// 全部使用 Node.js 內建 crypto 模組，不需要任何第三方套件。
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const db = require('./db');

const SECRET_PATH = path.join(__dirname, '..', 'data', 'session-secret.txt');

function getSessionSecret() {
  if (process.env.ADMIN_SESSION_SECRET) return process.env.ADMIN_SESSION_SECRET;
  if (fs.existsSync(SECRET_PATH)) return fs.readFileSync(SECRET_PATH, 'utf8').trim();
  const secret = crypto.randomBytes(32).toString('hex');
  fs.writeFileSync(SECRET_PATH, secret, { mode: 0o600 });
  return secret;
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

function verifyPassword(password, salt, expectedHash) {
  const { hash } = hashPassword(password, salt);
  const a = Buffer.from(hash, 'hex');
  const b = Buffer.from(expectedHash, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function hasAnyAdmin() {
  const row = db.prepare('SELECT COUNT(*) as c FROM admins').get();
  return row.c > 0;
}

function createAdmin(username, password) {
  const { hash, salt } = hashPassword(password);
  db.prepare(
    'INSERT INTO admins (username, password_hash, password_salt) VALUES (?, ?, ?)'
  ).run(username, hash, salt);
}

function findAdmin(username) {
  return db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
}

function checkLogin(username, password) {
  const admin = findAdmin(username);
  if (!admin) return false;
  return verifyPassword(password, admin.password_salt, admin.password_hash);
}

// ---- session token: base64(username.expiry).hmac ----
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 小時

// scope 用來區分 token 是給後台管理者用還是一般會員用，
// 避免會員登入的 token 被拿去冒充後台 session（反之亦然）。
function signSessionToken(username, scope = 'admin') {
  const expiry = Date.now() + SESSION_TTL_MS;
  const payload = `${scope}:${username}.${expiry}`;
  const b64 = Buffer.from(payload, 'utf8').toString('base64url');
  const mac = crypto.createHmac('sha256', getSessionSecret()).update(b64).digest('base64url');
  return `${b64}.${mac}`;
}

function verifySessionToken(token, expectedScope = 'admin') {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [b64, mac] = parts;
  const expectedMac = crypto
    .createHmac('sha256', getSessionSecret())
    .update(b64)
    .digest('base64url');
  const a = Buffer.from(mac);
  const b = Buffer.from(expectedMac);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  const payload = Buffer.from(b64, 'base64url').toString('utf8');
  const sepIdx = payload.indexOf(':');
  if (sepIdx === -1) return null;
  const scope = payload.slice(0, sepIdx);
  const rest = payload.slice(sepIdx + 1);
  const lastDot = rest.lastIndexOf('.');
  if (lastDot === -1) return null;
  const username = rest.slice(0, lastDot);
  const expiry = Number(rest.slice(lastDot + 1));
  if (scope !== expectedScope || !username || !expiry || Date.now() > expiry) return null;
  return { username };
}

module.exports = {
  hashPassword,
  verifyPassword,
  hasAnyAdmin,
  createAdmin,
  findAdmin,
  checkLogin,
  signSessionToken,
  verifySessionToken,
};
