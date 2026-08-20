// lib/http-utils.js
'use strict';

const { parseContentType, parseMultipart } = require('./multipart');

function parseCookies(req) {
  const header = req.headers.cookie;
  const out = {};
  if (!header) return out;
  header.split(';').forEach((pair) => {
    const idx = pair.indexOf('=');
    if (idx === -1) return;
    const k = pair.slice(0, idx).trim();
    const v = pair.slice(idx + 1).trim();
    out[k] = decodeURIComponent(v);
  });
  return out;
}

function setCookie(res, name, value, opts = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  parts.push('Path=/');
  parts.push('HttpOnly');
  parts.push('SameSite=Lax');
  if (opts.maxAgeSeconds) parts.push(`Max-Age=${opts.maxAgeSeconds}`);
  if (opts.expires) parts.push(`Expires=${opts.expires.toUTCString()}`);
  if (process.env.NODE_ENV === 'production') parts.push('Secure');
  const existing = res.getHeader('Set-Cookie');
  const cookieStr = parts.join('; ');
  if (existing) {
    res.setHeader('Set-Cookie', Array.isArray(existing) ? [...existing, cookieStr] : [existing, cookieStr]);
  } else {
    res.setHeader('Set-Cookie', cookieStr);
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    const MAX = 25 * 1024 * 1024; // 25MB 上限（含圖片上傳）
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX) {
        reject(new Error('Request body too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function parseRequestBody(req) {
  const contentType = req.headers['content-type'] || '';
  const buf = await readBody(req);

  if (contentType.includes('application/json')) {
    try {
      return { fields: buf.length ? JSON.parse(buf.toString('utf8')) : {}, files: {} };
    } catch {
      return { fields: {}, files: {} };
    }
  }

  if (contentType.includes('multipart/form-data')) {
    const { boundary } = parseContentType(contentType);
    if (!boundary) return { fields: {}, files: {} };
    return parseMultipart(buf, boundary);
  }

  // 預設當作 application/x-www-form-urlencoded
  const params = new URLSearchParams(buf.toString('utf8'));
  const fields = {};
  for (const [k, v] of params.entries()) fields[k] = v;
  return { fields, files: {} };
}

function sendHtml(res, html, status = 200) {
  res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

function sendJson(res, obj, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}

function redirect(res, location, status = 302) {
  res.writeHead(status, { Location: location });
  res.end();
}

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]));
}

module.exports = {
  parseCookies,
  setCookie,
  readBody,
  parseRequestBody,
  sendHtml,
  sendJson,
  redirect,
  escapeHtml,
};
