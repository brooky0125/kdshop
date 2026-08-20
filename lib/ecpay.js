// lib/ecpay.js
// 綠界科技（ECPay）全方位金流介接工具
// 演算法依據官方文件確認（2026-08 查證）：
//   - 檢查碼機制：https://developers.ecpay.com.tw/?p=2902
//   - 全方位金流付款：https://developers.ecpay.com.tw/2864/
//   - 測試介接資訊：https://developers.ecpay.com.tw/45895/
'use strict';

const crypto = require('crypto');

// ---- 測試環境（無信用卡 3D 驗證特店測試資料，綠界官方公開測試金鑰）----
const STAGE_CONFIG = {
  merchantID: '2000132',
  hashKey: '5294y06JbISpM5x9',
  hashIV: 'v77hoKGq4kWxNNIS',
  aioCheckoutUrl: 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5',
};

const PRODUCTION_URL = 'https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5';

function getConfig() {
  const mode = process.env.ECPAY_MODE || 'stage';
  if (mode === 'production') {
    return {
      merchantID: process.env.ECPAY_MERCHANT_ID,
      hashKey: process.env.ECPAY_HASH_KEY,
      hashIV: process.env.ECPAY_HASH_IV,
      aioCheckoutUrl: PRODUCTION_URL,
    };
  }
  return STAGE_CONFIG;
}

// 綠界的 URL encode 規則接近 .NET UrlEncode，跟 JS 內建 encodeURIComponent
// 有幾個字元的差異，需要額外替換（官方 PHP 範例邏輯的等價實作）。
function ecpayUrlEncode(str) {
  return encodeURIComponent(str)
    .replace(/%20/g, '+')
    .replace(/%2D/gi, '-')
    .replace(/%5F/gi, '_')
    .replace(/%2E/gi, '.')
    .replace(/%21/gi, '!')
    .replace(/%2A/gi, '*')
    .replace(/%28/gi, '(')
    .replace(/%29/gi, ')');
}

function genCheckMacValue(params, hashKey, hashIV) {
  const keys = Object.keys(params)
    .filter((k) => k !== 'CheckMacValue')
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

  const joined = keys.map((k) => `${k}=${params[k]}`).join('&');
  const raw = `HashKey=${hashKey}&${joined}&HashIV=${hashIV}`;
  const encoded = ecpayUrlEncode(raw).toLowerCase();
  const sha256 = crypto.createHash('sha256').update(encoded).digest('hex');
  return sha256.toUpperCase();
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function formatDate(d) {
  return `${d.getFullYear()}/${pad2(d.getMonth() + 1)}/${pad2(d.getDate())} ${pad2(
    d.getHours()
  )}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

// 產生一組合法的 MerchantTradeNo（限英數字，最長 20 碼）
function genMerchantTradeNo() {
  const ts = Date.now().toString(36);
  const rand = crypto.randomBytes(3).toString('hex');
  return `KD${ts}${rand}`.toUpperCase().slice(0, 20);
}

/**
 * 建立 AioCheckOut 表單所需的完整參數（含 CheckMacValue）
 * @param {object} order - { merchantTradeNo, totalAmount, itemNames: string[], returnURL, clientBackURL, orderResultURL }
 */
function buildAioCheckoutParams(order) {
  const cfg = getConfig();
  const params = {
    MerchantID: cfg.merchantID,
    MerchantTradeNo: order.merchantTradeNo,
    MerchantTradeDate: formatDate(new Date()),
    PaymentType: 'aio',
    TotalAmount: order.totalAmount,
    TradeDesc: 'KD Quande Stationery Order',
    ItemName: order.itemNames.join('#'),
    ReturnURL: order.returnURL,
    ChoosePayment: 'ALL',
    ClientBackURL: order.clientBackURL,
    OrderResultURL: order.orderResultURL,
    NeedExtraPaidInfo: 'Y',
    EncryptType: 1,
  };
  params.CheckMacValue = genCheckMacValue(params, cfg.hashKey, cfg.hashIV);
  return { params, aioCheckoutUrl: cfg.aioCheckoutUrl };
}

/**
 * 驗證綠界回傳（ReturnURL Server 端通知）的 CheckMacValue 是否正確
 */
function verifyCallback(payload) {
  const cfg = getConfig();
  const received = payload.CheckMacValue;
  const computed = genCheckMacValue(payload, cfg.hashKey, cfg.hashIV);
  return received && computed === received;
}

module.exports = {
  getConfig,
  genCheckMacValue,
  genMerchantTradeNo,
  buildAioCheckoutParams,
  verifyCallback,
};
