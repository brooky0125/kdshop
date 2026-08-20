// views/admin/posts.js
'use strict';

const { adminPage } = require('./layout');
const { escapeHtml } = require('../components');

function postsListView({ posts }) {
  const body = `
    <div class="admin-topbar">
      <h1>最新消息 / 社群動態</h1>
      <a class="btn" href="/admin/posts/new">+ 新增文章</a>
    </div>
    <table class="admin-table">
      <thead><tr><th>標題</th><th>平台</th><th>發布中</th><th>發布時間</th><th></th></tr></thead>
      <tbody>
        ${posts
          .map(
            (p) => `<tr>
            <td>${escapeHtml(p.title)}</td>
            <td>${escapeHtml(p.platform || '')}</td>
            <td>${p.is_published ? '✔' : ''}</td>
            <td>${new Date(p.published_at).toLocaleDateString('zh-Hant-TW')}</td>
            <td>
              <a class="btn outline small" href="/admin/posts/${p.id}/edit">編輯</a>
              <form method="POST" action="/admin/posts/${p.id}/delete" style="display:inline;" onsubmit="return confirm('確定要刪除嗎？');">
                <button class="btn danger small" type="submit">刪除</button>
              </form>
            </td>
          </tr>`
          )
          .join('\n')}
      </tbody>
    </table>
  `;
  return adminPage({ title: '最新消息', body, active: 'posts' });
}

function postFormView({ post, isNew }) {
  const p = post || {};
  const body = `
    <div class="admin-topbar"><h1>${isNew ? '新增文章' : '編輯文章'}</h1></div>
    <form class="admin-form" method="POST" action="${isNew ? '/admin/posts' : `/admin/posts/${p.id}`}" enctype="multipart/form-data">
      <label>標題<input type="text" name="title" required value="${escapeHtml(p.title || '')}" /></label>
      <label>平台／類型<select name="platform">
        ${['公告', 'Instagram', 'Threads', 'Facebook'].map((v) => `<option ${p.platform === v ? 'selected' : ''}>${v}</option>`).join('')}
      </select></label>
      <label>摘要（顯示於列表頁）<input type="text" name="excerpt" value="${escapeHtml(p.excerpt || '')}" /></label>
      <label>內文<textarea name="body" rows="6">${escapeHtml(p.body || '')}</textarea></label>
      <label class="checkbox-row"><input type="checkbox" name="is_published" ${p.is_published === undefined || p.is_published ? 'checked' : ''} /> 發布</label>
      <label>封面圖片（選填）<input type="file" name="cover_image" accept="image/*" /></label>
      ${p.cover_image ? `<img class="current-image" src="${escapeHtml(p.cover_image)}" alt="" style="width:220px;" />` : ''}
      <button class="btn" type="submit" style="margin-top:14px;">儲存</button>
      <a class="btn outline" href="/admin/posts" style="margin-top:14px;margin-left:8px;">取消</a>
    </form>
  `;
  return adminPage({ title: isNew ? '新增文章' : '編輯文章', body, active: 'posts' });
}

module.exports = { postsListView, postFormView };
