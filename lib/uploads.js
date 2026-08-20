// lib/uploads.js
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'images', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg']);

function saveUploadedFile(file) {
  if (!file || !file.data || !file.data.length) return null;
  const ext = path.extname(file.filename || '').toLowerCase() || '.jpg';
  const safeExt = ALLOWED_EXT.has(ext) ? ext : '.jpg';
  const name = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${safeExt}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, name), file.data);
  return `/images/uploads/${name}`;
}

module.exports = { saveUploadedFile };
