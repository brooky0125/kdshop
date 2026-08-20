// views/admin/products.js
'use strict';

const { adminPage } = require('./layout');
const { escapeHtml, money } = require('../components');
const { CATEGORIES } = require('../../lib/categories');

function productsListView({ products }) {
  const body = `
    <div class="admin-topbar">
      <h1>商品管理</h1>
      <a class="btn" href="/admin/products/new">+ 新增商品</a>
    </div>
    <table class="admin-table">
      <thead><tr><th>圖片</th><th>名稱</th><th>分類</th><th>價格</th><th>庫存</th><th>熱銷</th><th></th></tr></thead>
      <tbody>
        ${products
          .map(
            (p) => `<tr>
            <td><img src="${escapeHtml(p.image || '/images/placeholder.svg')}" alt="" /></td>
            <td>${escapeHtml(p.name)}</td>
            <td>${escapeHtml(p.category)}</td>
            <td>${money(p.price)}</td>
            <td>${p.stock}</td>
            <td>${p.is_bestseller ? '✔' : ''}</td>
            <td>
              <a class="btn outline small" href="/admin/products/${p.id}/edit">編輯</a>
              <form method="POST" action="/admin/products/${p.id}/delete" style="display:inline;" onsubmit="return confirm('確定要刪除這個商品嗎？');">
                <button class="btn danger small" type="submit">刪除</button>
              </form>
            </td>
          </tr>`
          )
          .join('\n')}
      </tbody>
    </table>
  `;
  return adminPage({ title: '商品管理', body, active: 'products' });
}

function categoryOptions(selected) {
  return CATEGORIES.map(
    (c) => `<option value="${escapeHtml(c)}" ${c === selected ? 'selected' : ''}>${escapeHtml(c)}</option>`
  ).join('\n');
}

function productFormView({ product, isNew }) {
  const p = product || {};
  const body = `
    <div class="admin-topbar"><h1>${isNew ? '新增商品' : '編輯商品'}</h1></div>
    <form class="admin-form" method="POST" action="${isNew ? '/admin/products' : `/admin/products/${p.id}`}" enctype="multipart/form-data">
      <label>商品名稱<input type="text" name="name" required value="${escapeHtml(p.name || '')}" /></label>
      <label>品牌<input type="text" name="brand" value="${escapeHtml(p.brand || '')}" /></label>
      <label>分類
        <select name="category">${categoryOptions(p.category)}</select>
      </label>
      <label>細項標籤（例如：修正帶、鋼珠筆）<input type="text" name="tag" value="${escapeHtml(p.tag || '')}" /></label>
      <label>價格（NT$）<input type="number" name="price" required min="0" value="${p.price ?? ''}" /></label>
      <label>庫存<input type="number" name="stock" min="0" value="${p.stock ?? 100}" /></label>
      <label>簡短描述<input type="text" name="short_desc" value="${escapeHtml(p.short_desc || '')}" /></label>
      <label>完整描述<textarea name="description" rows="4">${escapeHtml(p.description || '')}</textarea></label>
      <label class="checkbox-row"><input type="checkbox" name="is_bestseller" ${p.is_bestseller ? 'checked' : ''} /> 顯示於「熱銷榜」</label>
      <label>熱銷排名（選填，數字越小越前面）<input type="number" name="rank_sold" value="${p.rank_sold ?? ''}" /></label>
      <label class="checkbox-row"><input type="checkbox" name="is_ip_collab" ${p.is_ip_collab ? 'checked' : ''} /> 顯示於「IP 聯名專區」</label>
      <label>商品圖片（上傳新圖片以取代目前的圖）
        <input type="file" name="image" accept="image/*" />
      </label>
      ${p.image ? `<img class="current-image" src="${escapeHtml(p.image)}" alt="目前圖片" />` : ''}
      <button class="btn" type="submit" style="margin-top:14px;">儲存</button>
      <a class="btn outline" href="/admin/products" style="margin-top:14px;margin-left:8px;">取消</a>
    </form>
  `;
  return adminPage({ title: isNew ? '新增商品' : '編輯商品', body, active: 'products' });
}

module.exports = { productsListView, productFormView };
