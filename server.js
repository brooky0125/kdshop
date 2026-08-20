// server.js
// 全得文具 KD 官網 —— 純 Node.js 內建模組實作（無第三方套件依賴）
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

require('./lib/load-env').loadEnv();

const { Router } = require('./lib/router');
const {
  parseCookies, setCookie, parseRequestBody, sendHtml, sendJson, redirect, escapeHtml,
} = require('./lib/http-utils');

const products = require('./lib/products');
const banners = require('./lib/banners');
const posts = require('./lib/posts');
const cart = require('./lib/cart');
const orders = require('./lib/orders');
const customers = require('./lib/customers');
const auth = require('./lib/auth');
const ecpay = require('./lib/ecpay');
const analytics = require('./lib/analytics');
const { saveUploadedFile } = require('./lib/uploads');
const { CATEGORIES } = require('./lib/categories');

const layout = require('./views/layout');
const { homePage } = require('./views/home');
const { productsPage, productDetailPage } = require('./views/products');
const { cartPage } = require('./views/cart');
const { checkoutPage, ecpayRedirectPage, checkoutResultPage } = require('./views/checkout');
const { brandStoryPage } = require('./views/brand-story');
const { newsListPage, newsDetailPage } = require('./views/news');
const { loginPage, registerPage, accountPage } = require('./views/account');

const adminAuthViews = require('./views/admin/auth');
const { dashboardView } = require('./views/admin/dashboard');
const { productsListView, productFormView } = require('./views/admin/products');
const { bannersListView, bannerFormView } = require('./views/admin/banners');
const { postsListView, postFormView } = require('./views/admin/posts');
const { ordersListView } = require('./views/admin/orders');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// ---------- 共用小工具 ----------

function getBaseUrl(req) {
  if (process.env.BASE_URL) return process.env.BASE_URL.replace(/\/$/, '');
  const proto = req.headers['x-forwarded-proto'] || 'http';
  return `${proto}://${req.headers.host}`;
}

function getCartId(req, res) {
  const cookies = parseCookies(req);
  const id = cart.ensureCart(cookies.cart_id);
  if (id !== cookies.cart_id) {
    setCookie(res, 'cart_id', id, { maxAgeSeconds: 60 * 60 * 24 * 180 });
  }
  return id;
}

function getCustomer(req) {
  const cookies = parseCookies(req);
  const session = auth.verifySessionToken(cookies.customer_session, 'customer');
  if (!session) return null;
  return customers.findByEmail(session.username);
}

function requireAdmin(req, res) {
  const cookies = parseCookies(req);
  const session = auth.verifySessionToken(cookies.admin_session, 'admin');
  if (!session) {
    redirect(res, '/admin/login');
    return null;
  }
  return session;
}

function cartCountFor(cartId) {
  return cart.getCartSummary(cartId).totalQuantity;
}

// ---------- Router ----------

const router = new Router();

// ===== 前台：首頁 / 品牌故事 =====
router.get('/', (req, res) => {
  const cartId = getCartId(req, res);
  const html = layout.page({
    title: '首頁',
    cartCount: cartCountFor(cartId),
    customer: getCustomer(req),
    body: homePage({
      bestsellers: products.listBestsellers(10),
      ipCollab: products.listIpCollab(),
      banners: banners.listActiveBanners(),
      categories: products.listCategories(),
    }),
  });
  sendHtml(res, html);
});

router.get('/brand-story', (req, res) => {
  const cartId = getCartId(req, res);
  sendHtml(res, layout.page({
    title: '品牌故事',
    cartCount: cartCountFor(cartId),
    customer: getCustomer(req),
    body: brandStoryPage(),
  }));
});

// ===== 前台：商品 =====
router.get('/products', (req, res, url) => {
  const cartId = getCartId(req, res);
  const category = url.searchParams.get('category') || null;
  sendHtml(res, layout.page({
    title: category || '全部商品',
    cartCount: cartCountFor(cartId),
    customer: getCustomer(req),
    body: productsPage({
      products: products.listProducts({ category }),
      categories: products.listCategories(),
      activeCategory: category,
    }),
  }));
});

router.get('/products/:slug', (req, res, url, params) => {
  const cartId = getCartId(req, res);
  const product = products.getBySlug(params.slug);
  if (!product) {
    sendHtml(res, layout.page({ title: '找不到商品', cartCount: cartCountFor(cartId), customer: getCustomer(req),
      body: `<section><div class="container"><div class="empty-state"><h2>找不到這個商品</h2><a class="btn" href="/products">回商品列表</a></div></div></section>` }), 404);
    return;
  }
  sendHtml(res, layout.page({
    title: product.name,
    cartCount: cartCountFor(cartId),
    customer: getCustomer(req),
    body: productDetailPage({ product }),
  }));
});

// ===== 前台：購物車 =====
router.get('/cart', (req, res) => {
  const cartId = getCartId(req, res);
  const { items, totalAmount } = cart.getCartSummary(cartId);
  sendHtml(res, layout.page({
    title: '購物車',
    cartCount: cartCountFor(cartId),
    customer: getCustomer(req),
    body: cartPage({ items, totalAmount }),
  }));
});

router.post('/cart/add', async (req, res) => {
  const cartId = getCartId(req, res);
  const { fields } = await parseRequestBody(req);
  const productId = Number(fields.productId);
  const quantity = Math.max(1, Number(fields.quantity) || 1);
  if (products.getById(productId)) {
    cart.addItem(cartId, productId, quantity);
  }
  redirect(res, '/cart');
});

router.post('/cart/update', async (req, res) => {
  const cartId = getCartId(req, res);
  const { fields } = await parseRequestBody(req);
  cart.updateItem(cartId, Number(fields.productId), Number(fields.quantity) || 0);
  redirect(res, '/cart');
});

router.post('/cart/remove', async (req, res) => {
  const cartId = getCartId(req, res);
  const { fields } = await parseRequestBody(req);
  cart.removeItem(cartId, Number(fields.productId));
  redirect(res, '/cart');
});

// ===== 前台：結帳 + 綠界金流 =====
router.get('/checkout', (req, res) => {
  const cartId = getCartId(req, res);
  const { items, totalAmount } = cart.getCartSummary(cartId);
  if (!items.length) {
    redirect(res, '/cart');
    return;
  }
  const customer = getCustomer(req);
  sendHtml(res, layout.page({
    title: '結帳',
    cartCount: cartCountFor(cartId),
    customer,
    body: checkoutPage({ items, totalAmount, customer }),
  }));
});

router.post('/checkout', async (req, res) => {
  const cartId = getCartId(req, res);
  const { items, totalAmount } = cart.getCartSummary(cartId);
  if (!items.length) { redirect(res, '/cart'); return; }

  const { fields } = await parseRequestBody(req);
  const { name, phone, email, address } = fields;
  if (!name || !phone || !email || !address) {
    sendHtml(res, layout.page({
      title: '結帳',
      cartCount: cartCountFor(cartId),
      customer: getCustomer(req),
      body: checkoutPage({ items, totalAmount, customer: fields, error: '請完整填寫收件資訊' }),
    }));
    return;
  }

  const customer = getCustomer(req);
  const { merchantTradeNo } = orders.createOrder({
    cartId,
    items: items.map((i) => ({ productId: i.productId, name: i.name, price: i.price, quantity: i.quantity })),
    totalAmount,
    customer: { name, phone, email, address },
    customerId: customer ? customer.id : null,
  });

  const baseUrl = getBaseUrl(req);
  const { params, aioCheckoutUrl } = ecpay.buildAioCheckoutParams({
    merchantTradeNo,
    totalAmount,
    itemNames: items.map((i) => `${i.name} x${i.quantity}`),
    returnURL: `${baseUrl}/api/ecpay/callback`,
    clientBackURL: `${baseUrl}/checkout/result?trade_no=${merchantTradeNo}`,
    orderResultURL: `${baseUrl}/checkout/result?trade_no=${merchantTradeNo}`,
  });

  cart.clearCart(cartId);
  sendHtml(res, ecpayRedirectPage({ aioCheckoutUrl, params }));
});

// 綠界 Server 端付款結果通知（ReturnURL）—— 必須回應純文字 "1|OK"
router.post('/api/ecpay/callback', async (req, res) => {
  const { fields } = await parseRequestBody(req);
  const ok = ecpay.verifyCallback(fields);
  if (!ok) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('0|CheckMacValue Error');
    return;
  }
  const tradeNo = fields.MerchantTradeNo;
  if (fields.RtnCode === '1') {
    orders.markOrderPaid(tradeNo, { ecpayTradeNo: fields.TradeNo, payload: fields });
  } else {
    orders.markOrderFailed(tradeNo, fields);
  }
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('1|OK');
});

router.get('/checkout/result', (req, res, url) => {
  const cartId = getCartId(req, res);
  const tradeNo = url.searchParams.get('trade_no');
  const order = tradeNo ? orders.getOrderByTradeNo(tradeNo) : null;
  if (!order) {
    sendHtml(res, layout.page({ title: '找不到訂單', cartCount: cartCountFor(cartId), customer: getCustomer(req),
      body: `<section><div class="container"><div class="empty-state"><h2>找不到這筆訂單</h2></div></div></section>` }), 404);
    return;
  }
  sendHtml(res, layout.page({
    title: '訂單結果',
    cartCount: cartCountFor(cartId),
    customer: getCustomer(req),
    body: checkoutResultPage({ order }),
  }));
});

// ===== 前台：最新消息 =====
router.get('/news', (req, res) => {
  const cartId = getCartId(req, res);
  sendHtml(res, layout.page({
    title: '最新消息',
    cartCount: cartCountFor(cartId),
    customer: getCustomer(req),
    body: newsListPage({ posts: posts.listPublished() }),
  }));
});

router.get('/news/:slug', (req, res, url, params) => {
  const cartId = getCartId(req, res);
  const post = posts.getBySlug(params.slug);
  if (!post) {
    sendHtml(res, layout.page({ title: '找不到文章', cartCount: cartCountFor(cartId), customer: getCustomer(req),
      body: `<section><div class="container"><div class="empty-state"><h2>找不到這篇文章</h2></div></div></section>` }), 404);
    return;
  }
  sendHtml(res, layout.page({
    title: post.title,
    cartCount: cartCountFor(cartId),
    customer: getCustomer(req),
    body: newsDetailPage({ post }),
  }));
});

// ===== 前台：會員 =====
router.get('/login', (req, res) => {
  const cartId = getCartId(req, res);
  sendHtml(res, layout.page({ title: '會員登入', cartCount: cartCountFor(cartId), customer: getCustomer(req), body: loginPage({}) }));
});

router.post('/login', async (req, res) => {
  const { fields } = await parseRequestBody(req);
  const customer = customers.login(fields.email, fields.password);
  if (!customer) {
    const cartId = getCartId(req, res);
    sendHtml(res, layout.page({ title: '會員登入', cartCount: cartCountFor(cartId), customer: null,
      body: loginPage({ error: 'Email 或密碼不正確' }) }));
    return;
  }
  const token = auth.signSessionToken(customer.email, 'customer');
  setCookie(res, 'customer_session', token, { maxAgeSeconds: 60 * 60 * 12 });
  redirect(res, '/account');
});

router.get('/register', (req, res) => {
  const cartId = getCartId(req, res);
  sendHtml(res, layout.page({ title: '加入會員', cartCount: cartCountFor(cartId), customer: getCustomer(req), body: registerPage({}) }));
});

router.post('/register', async (req, res) => {
  const { fields } = await parseRequestBody(req);
  const cartId = getCartId(req, res);
  try {
    if (!fields.email || !fields.password || fields.password.length < 8) {
      throw Object.assign(new Error('INVALID'), { code: 'INVALID' });
    }
    customers.register(fields);
    const token = auth.signSessionToken(fields.email.toLowerCase().trim(), 'customer');
    setCookie(res, 'customer_session', token, { maxAgeSeconds: 60 * 60 * 12 });
    redirect(res, '/account');
  } catch (err) {
    const msg = err.code === 'EMAIL_TAKEN' ? '這個 Email 已經註冊過了' : '請確認欄位填寫正確（密碼至少 8 碼）';
    sendHtml(res, layout.page({ title: '加入會員', cartCount: cartCountFor(cartId), customer: null,
      body: registerPage({ error: msg }) }));
  }
});

router.get('/account', (req, res) => {
  const cartId = getCartId(req, res);
  const customer = getCustomer(req);
  if (!customer) { redirect(res, '/login'); return; }
  sendHtml(res, layout.page({
    title: '我的帳戶',
    cartCount: cartCountFor(cartId),
    customer,
    body: accountPage({ customer, orders: customers.getOrderHistory(customer.id) }),
  }));
});

router.get('/account/logout', (req, res) => {
  setCookie(res, 'customer_session', '', { maxAgeSeconds: 0 });
  redirect(res, '/');
});

// ===== 後台管理 =====
router.get('/admin/setup', (req, res) => {
  if (auth.hasAnyAdmin()) { redirect(res, '/admin/login'); return; }
  sendHtml(res, adminAuthViews.setupPage({}));
});

router.post('/admin/setup', async (req, res) => {
  if (auth.hasAnyAdmin()) { redirect(res, '/admin/login'); return; }
  const { fields } = await parseRequestBody(req);
  if (!fields.username || !fields.password || fields.password.length < 8) {
    sendHtml(res, adminAuthViews.setupPage({ error: '請輸入帳號，密碼至少 8 碼' }));
    return;
  }
  auth.createAdmin(fields.username, fields.password);
  const token = auth.signSessionToken(fields.username, 'admin');
  setCookie(res, 'admin_session', token, { maxAgeSeconds: 60 * 60 * 12 });
  redirect(res, '/admin');
});

router.get('/admin/login', (req, res) => {
  if (!auth.hasAnyAdmin()) { redirect(res, '/admin/setup'); return; }
  sendHtml(res, adminAuthViews.loginPage({}));
});

router.post('/admin/login', async (req, res) => {
  const { fields } = await parseRequestBody(req);
  if (!auth.checkLogin(fields.username, fields.password)) {
    sendHtml(res, adminAuthViews.loginPage({ error: '帳號或密碼不正確' }));
    return;
  }
  const token = auth.signSessionToken(fields.username, 'admin');
  setCookie(res, 'admin_session', token, { maxAgeSeconds: 60 * 60 * 12 });
  redirect(res, '/admin');
});

router.get('/admin/logout', (req, res) => {
  setCookie(res, 'admin_session', '', { maxAgeSeconds: 0 });
  redirect(res, '/admin/login');
});

router.get('/admin', (req, res) => {
  if (!requireAdmin(req, res)) return;
  sendHtml(res, dashboardView({ summary: analytics.getSummary() }));
});

// -- 商品管理 --
router.get('/admin/products', (req, res) => {
  if (!requireAdmin(req, res)) return;
  sendHtml(res, productsListView({ products: products.listProducts({}) }));
});

router.get('/admin/products/new', (req, res) => {
  if (!requireAdmin(req, res)) return;
  sendHtml(res, productFormView({ product: null, isNew: true }));
});

router.post('/admin/products', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const { fields, files } = await parseRequestBody(req);
  const image = saveUploadedFile(files.image);
  const id = products.createProduct({ ...fields, image });
  redirect(res, `/admin/products/${id}/edit`);
});

router.get('/admin/products/:id/edit', (req, res, url, params) => {
  if (!requireAdmin(req, res)) return;
  const product = products.getById(Number(params.id));
  if (!product) { redirect(res, '/admin/products'); return; }
  sendHtml(res, productFormView({ product, isNew: false }));
});

router.post('/admin/products/:id', async (req, res, url, params) => {
  if (!requireAdmin(req, res)) return;
  const { fields, files } = await parseRequestBody(req);
  const image = saveUploadedFile(files.image);
  products.updateProduct(Number(params.id), { ...fields, image });
  redirect(res, `/admin/products/${params.id}/edit`);
});

router.post('/admin/products/:id/delete', (req, res, url, params) => {
  if (!requireAdmin(req, res)) return;
  products.deleteProduct(Number(params.id));
  redirect(res, '/admin/products');
});

// -- Banner 管理 --
router.get('/admin/banners', (req, res) => {
  if (!requireAdmin(req, res)) return;
  sendHtml(res, bannersListView({ banners: banners.listAllBanners() }));
});

router.get('/admin/banners/new', (req, res) => {
  if (!requireAdmin(req, res)) return;
  sendHtml(res, bannerFormView({ banner: null, isNew: true }));
});

router.post('/admin/banners', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const { fields, files } = await parseRequestBody(req);
  const image = saveUploadedFile(files.image);
  if (!image) {
    sendHtml(res, bannerFormView({ banner: fields, isNew: true }));
    return;
  }
  const id = banners.createBanner({ ...fields, image });
  redirect(res, `/admin/banners/${id}/edit`);
});

router.get('/admin/banners/:id/edit', (req, res, url, params) => {
  if (!requireAdmin(req, res)) return;
  const banner = banners.getBanner(Number(params.id));
  if (!banner) { redirect(res, '/admin/banners'); return; }
  sendHtml(res, bannerFormView({ banner, isNew: false }));
});

router.post('/admin/banners/:id', async (req, res, url, params) => {
  if (!requireAdmin(req, res)) return;
  const { fields, files } = await parseRequestBody(req);
  const image = saveUploadedFile(files.image);
  banners.updateBanner(Number(params.id), { ...fields, image });
  redirect(res, `/admin/banners/${params.id}/edit`);
});

router.post('/admin/banners/:id/delete', (req, res, url, params) => {
  if (!requireAdmin(req, res)) return;
  banners.deleteBanner(Number(params.id));
  redirect(res, '/admin/banners');
});

// -- 最新消息管理 --
router.get('/admin/posts', (req, res) => {
  if (!requireAdmin(req, res)) return;
  sendHtml(res, postsListView({ posts: posts.listAll() }));
});

router.get('/admin/posts/new', (req, res) => {
  if (!requireAdmin(req, res)) return;
  sendHtml(res, postFormView({ post: null, isNew: true }));
});

router.post('/admin/posts', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const { fields, files } = await parseRequestBody(req);
  const cover_image = saveUploadedFile(files.cover_image);
  const id = posts.createPost({ ...fields, cover_image });
  redirect(res, `/admin/posts/${id}/edit`);
});

router.get('/admin/posts/:id/edit', (req, res, url, params) => {
  if (!requireAdmin(req, res)) return;
  const post = posts.getById(Number(params.id));
  if (!post) { redirect(res, '/admin/posts'); return; }
  sendHtml(res, postFormView({ post, isNew: false }));
});

router.post('/admin/posts/:id', async (req, res, url, params) => {
  if (!requireAdmin(req, res)) return;
  const { fields, files } = await parseRequestBody(req);
  const cover_image = saveUploadedFile(files.cover_image);
  posts.updatePost(Number(params.id), { ...fields, cover_image });
  redirect(res, `/admin/posts/${params.id}/edit`);
});

router.post('/admin/posts/:id/delete', (req, res, url, params) => {
  if (!requireAdmin(req, res)) return;
  posts.deletePost(Number(params.id));
  redirect(res, '/admin/posts');
});

// -- 訂單列表 --
router.get('/admin/orders', (req, res) => {
  if (!requireAdmin(req, res)) return;
  sendHtml(res, ordersListView({ orders: orders.listAllOrders() }));
});

// ---------- 靜態檔案 ----------

const MIME = {
  '.css': 'text/css', '.js': 'application/javascript', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.gif': 'image/gif', '.ico': 'image/x-icon',
};

function tryServeStatic(req, res, pathname) {
  if (!pathname.startsWith('/css/') && !pathname.startsWith('/js/') && !pathname.startsWith('/images/')) {
    return false;
  }
  const filePath = path.join(PUBLIC_DIR, pathname);
  if (!filePath.startsWith(PUBLIC_DIR)) return false; // 防止路徑跳脫
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return false;
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
  return true;
}

// ---------- HTTP Server ----------

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = decodeURIComponent(url.pathname);

    if (tryServeStatic(req, res, pathname)) return;

    const match = router.match(req.method, pathname);
    if (!match) {
      sendHtml(res, `<h1>404</h1><p>找不到頁面 ${escapeHtml(pathname)}</p><a href="/">回首頁</a>`, 404);
      return;
    }
    await match.handler(req, res, url, match.params);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      sendHtml(res, `<h1>500</h1><p>伺服器發生錯誤，請稍後再試。</p>`, 500);
    }
  }
});

server.listen(PORT, () => {
  console.log(`全得文具 KD 網站已啟動：http://localhost:${PORT}`);
  console.log(`後台管理入口：http://localhost:${PORT}/admin/setup`);
});
