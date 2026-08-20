// views/admin/banners.js
'use strict';

const { adminPage } = require('./layout');
const { escapeHtml } = require('../components');

function bannersListView({ banners }) {
  const body = `
    <div class="admin-topbar">
      <h1>Banner 管理</h1>
      <a class="btn" href="/admin/banners/new">+ 新增 Banner</a>
    </div>
    <table class="admin-table">
      <thead><tr><th>圖片</th><th>標題</th><th>啟用中</th><th>排序</th><th>上下架時間</th><th></th></tr></thead>
      <tbody>
        ${banners
          .map(
            (b) => `<tr>
            <td><img src="${escapeHtml(b.image)}" alt="" /></td>
            <td>${escapeHtml(b.title)}</td>
            <td>${b.is_active ? '✔' : ''}</td>
            <td>${b.sort_order}</td>
            <td style="font-size:12px;color:#5b6259;">${escapeHtml(b.starts_at || '不限')} ~ ${escapeHtml(b.ends_at || '不限')}</td>
            <td>
              <a class="btn outline small" href="/admin/banners/${b.id}/edit">編輯</a>
              <form method="POST" action="/admin/banners/${b.id}/delete" style="display:inline;" onsubmit="return confirm('確定要刪除這個 Banner 嗎？');">
                <button class="btn danger small" type="submit">刪除</button>
              </form>
            </td>
          </tr>`
          )
          .join('\n')}
      </tbody>
    </table>
  `;
  return adminPage({ title: 'Banner 管理', body, active: 'banners' });
}

function bannerFormView({ banner, isNew }) {
  const b = banner || {};
  const body = `
    <div class="admin-topbar"><h1>${isNew ? '新增 Banner' : '編輯 Banner'}</h1></div>
    <form class="admin-form" method="POST" action="${isNew ? '/admin/banners' : `/admin/banners/${b.id}`}" enctype="multipart/form-data">
      <label>標題<input type="text" name="title" required value="${escapeHtml(b.title || '')}" /></label>
      <label>副標題<input type="text" name="subtitle" value="${escapeHtml(b.subtitle || '')}" /></label>
      <label>連結網址（點擊 Banner 後跳轉，可留空）<input type="text" name="link_url" value="${escapeHtml(b.link_url || '')}" /></label>
      <label>排序（數字越小越前面）<input type="number" name="sort_order" value="${b.sort_order ?? 0}" /></label>
      <label>上架時間（選填，格式 YYYY-MM-DD）<input type="text" name="starts_at" value="${escapeHtml(b.starts_at || '')}" /></label>
      <label>下架時間（選填，格式 YYYY-MM-DD）<input type="text" name="ends_at" value="${escapeHtml(b.ends_at || '')}" /></label>
      <label class="checkbox-row"><input type="checkbox" name="is_active" ${b.is_active === undefined || b.is_active ? 'checked' : ''} /> 啟用</label>
      <label>Banner 圖片（上傳新圖片以取代目前的圖，建議尺寸 1600x600）
        <input type="file" name="image" accept="image/*" ${isNew ? 'required' : ''} />
      </label>
      ${b.image ? `<img class="current-image" src="${escapeHtml(b.image)}" alt="目前圖片" style="width:220px;" />` : ''}
      <button class="btn" type="submit" style="margin-top:14px;">儲存</button>
      <a class="btn outline" href="/admin/banners" style="margin-top:14px;margin-left:8px;">取消</a>
    </form>
  `;
  return adminPage({ title: isNew ? '新增 Banner' : '編輯 Banner', body, active: 'banners' });
}

module.exports = { bannersListView, bannerFormView };
