// lib/multipart.js
// 最小可用的 multipart/form-data 解析器（不依賴第三方套件）。
// 用途：後台上傳商品圖片／banner 圖片。
'use strict';

function parseContentType(header) {
  const parts = header.split(';').map((s) => s.trim());
  const type = parts[0];
  let boundary = null;
  for (const p of parts.slice(1)) {
    if (p.startsWith('boundary=')) {
      boundary = p.slice('boundary='.length).replace(/^"|"$/g, '');
    }
  }
  return { type, boundary };
}

// buffer: 整個 request body 的 Buffer
// boundary: 從 content-type header 解析出來的 boundary 字串（不含 --）
function parseMultipart(buffer, boundary) {
  const boundaryBuf = Buffer.from(`--${boundary}`);
  const fields = {};
  const files = {};

  let start = buffer.indexOf(boundaryBuf);
  while (start !== -1) {
    const nextStart = buffer.indexOf(boundaryBuf, start + boundaryBuf.length);
    if (nextStart === -1) break;

    // part 內容夾在這個 boundary 跟下一個 boundary 之間
    let partBuf = buffer.slice(start + boundaryBuf.length, nextStart);
    // 去掉開頭的 \r\n，以及結尾的 \r\n--（下一個 boundary 前的分隔）
    if (partBuf.slice(0, 2).toString() === '\r\n') partBuf = partBuf.slice(2);
    if (partBuf.slice(-2).toString() === '\r\n') partBuf = partBuf.slice(0, -2);

    const headerEnd = partBuf.indexOf('\r\n\r\n');
    if (headerEnd !== -1) {
      const headerStr = partBuf.slice(0, headerEnd).toString('utf8');
      const body = partBuf.slice(headerEnd + 4);

      const dispositionMatch = headerStr.match(/Content-Disposition:\s*form-data;([^\r\n]*)/i);
      const nameMatch = headerStr.match(/name="([^"]*)"/i);
      const filenameMatch = headerStr.match(/filename="([^"]*)"/i);
      const contentTypeMatch = headerStr.match(/Content-Type:\s*([^\r\n]*)/i);

      const name = nameMatch ? nameMatch[1] : null;
      if (name) {
        if (filenameMatch && filenameMatch[1]) {
          files[name] = {
            filename: filenameMatch[1],
            contentType: contentTypeMatch ? contentTypeMatch[1].trim() : 'application/octet-stream',
            data: body,
          };
        } else {
          fields[name] = body.toString('utf8');
        }
      }
      void dispositionMatch;
    }

    start = nextStart;
  }

  return { fields, files };
}

module.exports = { parseContentType, parseMultipart };
