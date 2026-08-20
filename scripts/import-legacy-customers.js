// scripts/import-legacy-customers.js
// 用途：把舊 ASP 網站（kdshop.com.tw）匯出的會員名單匯入新網站。
//
// 使用方式：
//   node scripts/import-legacy-customers.js path/to/members.csv
//
// CSV 欄位需求（第一列為欄位名稱，欄位順序不拘）：
//   email,legacy_member_no,name,phone,address
//
// 注意：
// 1. 舊系統的密碼雜湊格式通常跟這裡用的 scrypt 不相容，所以匯入的帳號會給一組隨機密碼，
//    並不會員知道。建議正式匯入前，先規劃「舊會員第一次登入請用忘記密碼／設定密碼」的通知流程
//    （例如發 email 或簡訊通知），這個腳本只負責建立帳號本身。
// 2. email 重複的資料會被跳過，不會覆蓋現有帳號。
'use strict';

const fs = require('fs');
const path = require('path');
const customers = require('../lib/customers');

function parseCsvLine(line) {
  // 簡易 CSV 解析（支援雙引號包欄位、逗號分隔），不支援跨行欄位
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { cur += ch; }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      result.push(cur); cur = '';
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result.map((s) => s.trim());
}

function run(csvPath) {
  if (!csvPath) {
    console.error('用法：node scripts/import-legacy-customers.js path/to/members.csv');
    process.exit(1);
  }
  const fullPath = path.resolve(csvPath);
  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());

  let imported = 0;
  let skipped = 0;

  for (const line of lines.slice(1)) {
    const cols = parseCsvLine(line);
    const row = {};
    headers.forEach((h, i) => { row[h] = cols[i]; });

    if (!row.email) { skipped++; continue; }

    const result = customers.importLegacyCustomer({
      email: row.email,
      legacyMemberNo: row.legacy_member_no || row.member_no || '',
      name: row.name || '',
      phone: row.phone || '',
      address: row.address || '',
    });

    if (result.skipped) skipped++;
    else imported++;
  }

  console.log(`匯入完成：新增 ${imported} 筆會員，跳過 ${skipped} 筆（已存在或缺少 email）。`);
}

if (require.main === module) {
  run(process.argv[2]);
}

module.exports = { run };
