# 全得文具 KD 官方購物網站

品牌形象＋商品／購物車／結帳／綠界金流／會員／後台管理的完整原型。目前為「功能優先」版本：畫面版型是暫時樣式，等 Figma 設計稿定案後會替換成正式視覺，但資料結構與購物流程不需要重做。

## 這個專案的技術選擇（重要，請先讀）

這個專案**刻意做成零第三方套件依賴**（`package.json` 的 `dependencies` 是空的），只用 Node.js 內建模組（`http`、`node:sqlite`、`crypto` 等）。原因：

1. 開發環境的網路限制無法安裝 npm 套件，所以整個後端（路由、資料庫、multipart 檔案上傳解析、綠界金流串接）都是手刻的。
2. 附帶好處：部署極輕量，任何有 Node.js 22.5+ 的主機，`npm run setup && npm start` 就能跑，沒有相依套件版本地雷。

如果你們的工程團隊之後想換成 Next.js／Express／Prisma 等框架，這裡的商業邏輯（`lib/` 資料夾）幾乎可以直接搬過去，因為它本來就是跟框架無關的純函式。

## 快速開始

```bash
# 需要 Node.js 22.5 以上（有內建 node:sqlite）
node -v

npm run setup   # 建立資料庫、匯入範例商品、產生佔位商品圖、建立範例首頁 Banner
npm start       # 啟動網站，預設 http://localhost:3000
```

第一次開啟後台：前往 `http://localhost:3000/admin/setup` 建立管理員帳號（帳號密碼是你自己設定，不是我這邊寫死的）。之後登入請走 `/admin/login`。

## 專案結構

```
quande-web/
  server.js              # 唯一進入點：HTTP 伺服器 + 路由表
  lib/                    # 商業邏輯（資料庫、購物車、訂單、綠界金流、會員、後台驗證...）
  views/                  # 前台頁面樣板（HTML 字串產生函式）
  views/admin/            # 後台頁面樣板
  public/css/styles.css   # 前台樣式 —— 等 Figma 稿定案後主要會改這個檔案
  public/css/admin.css    # 後台樣式（功能性介面，不受前台設計影響）
  public/js/main.js       # 前台少量互動 JS
  scripts/                # 一次性腳本：匯入商品／banner／舊會員、產生佔位圖
  data/quande.db          # SQLite 資料庫檔案（執行 setup 後產生，不要提交進版本控制）
```

## Figma 設計稿定案後，怎麼套版？

版面結構（每個頁面有哪些區塊、資料怎麼帶入）已經在 `views/*.js` 裡面寫好了，這些檔案回傳的是 HTML 字串。等設計稿確定後：

1. 主要改 `public/css/styles.css`（顏色、字體、間距、RWD 斷點），這是唯一一份前台樣式表。
2. 如果設計稿的版面結構跟現在差很多（例如區塊順序、有新的區塊），才需要動到 `views/*.js` 裡的 HTML 結構，但資料怎麼查、怎麼傳進頁面（`server.js` 呼叫 view 函式的方式）不需要改。
3. 目前抓的設計尺寸：桌機內容安全寬度 1160px、手機安全邊距左右 20px，如果 Figma 用了不同數字，跟我說一聲我把 `--max-width` 變數對齊即可。

## 商品分類

沿用舊站（kdshop.com.tw）既有的 18 個分類架構（見 `lib/categories.js`），方便顧客習慣不變、也比較容易銜接舊站的 SEO。目前的範例商品資料是依「全得社群行銷提案 2026」PDF 裡的明星商品 TOP10 ＋ IP 聯名商品建立的，**售價是佔位用的範例價格**，正式上線前請透過後台一一替換成真實售價與庫存。

## 後台功能

登入 `/admin` 後可以：

- **商品管理**（`/admin/products`）：新增／編輯／刪除商品，可直接上傳商品圖片
- **Banner 管理**（`/admin/banners`）：首頁廣告 Banner，可設定上下架時間、排序、連結
- **最新消息**（`/admin/posts`）：公告／社群動態文章，串接首頁「最新貼文」與 `/news` 頁面
- **訂單列表**（`/admin/orders`）：所有訂單與付款狀態
- **儀表板**（`/admin`）：累計訂單數、已付款營收、熱銷商品 TOP5、最近訂單

## 會員系統

前台會員（`/register`、`/login`、`/account`）跟後台管理員帳號是完全分開的兩套系統（不同的資料表、不同的登入 session，互相無法冒用）。結帳同時支援「會員登入後結帳」與「訪客結帳」。

### 從舊網站（kdshop.com.tw）匯入會員資料

舊站是 ASP 系統，我這邊沒有辦法直接連進去撈資料，需要請你們現在的網站服務商（頁尊上寫的是 topstudios）協助匯出會員名單成 CSV，欄位需求：

```
email,legacy_member_no,name,phone,address
```

拿到 CSV 後執行：

```bash
node scripts/import-legacy-customers.js path/to/members.csv
```

**注意**：舊系統的密碼沒辦法直接搬過來（雜湊格式不相容），匯入後的帳號會產生一組隨機密碼，實務上需要搭配「請舊會員透過忘記密碼重新設定」的通知流程（目前這版還沒做 email 寄送，見下方「還沒做的事」）。

## 綠界金流（ECPay）

目前串的是**綠界官方測試環境**（沙盒），可以直接測試完整下單流程，不會產生真實金流：

- 測試環境特店編號：`2000132`（綠界官方公開的測試帳號，不是我們申請的）
- 測試信用卡卡號：`4311-9522-2222-2222`，安全碼 `222`

### 正式上線前需要做的事

1. 到[綠界科技官網](https://www.ecpay.com.tw/)申請正式特店帳號（需要公司登記資料、銀行帳戶等），審核通過後會拿到正式的 MerchantID / HashKey / HashIV。
2. 複製 `.env.example` 為 `.env`，填入：
   ```
   ECPAY_MODE=production
   ECPAY_MERCHANT_ID=<正式特店編號>
   ECPAY_HASH_KEY=<正式 HashKey>
   ECPAY_HASH_IV=<正式 HashIV>
   BASE_URL=https://你的正式網域
   ```
3. 重新啟動服務即可切換到正式金流，不需要改程式碼。

CheckMacValue 檢查碼演算法是依照綠界官方文件（[檢查碼機制](https://developers.ecpay.com.tw/?p=2902)）實作，已經過測試環境完整驗證（下單 → 綠界付款頁 → 付款結果通知 → 訂單狀態更新為已付款，整條路都測過）。

## 部署建議

這是一個會持續運行、需要寫入本機 SQLite 檔案的 Node.js 服務，**不適合放在 Vercel 這類 Serverless 平台**（Serverless 環境的檔案系統是暫時的，SQLite 資料會不見）。建議：

- **Railway** 或 **Render**：對 Node.js 專案最省事，也都支援掛載持久化磁碟（存放 `data/quande.db` 跟 `public/images/uploads/`），有免費／低價方案可以先上線測試。
- 如果之後流量變大、需要多台伺服器，屆時再把 SQLite 換成 Postgres（`lib/db.js` 是唯一需要改的檔案）。

網域的話，可以先用 Cloudflare、GoDaddy 或台灣的網路中文（NET-CHINESE）、PChome 網路家庭等註冊 `.tw` 或 `.com` 網域，設定 DNS 指到主機商提供的位址即可。這部分等你們決定要用哪家主機商，我可以再給更具體的步驟。

## 環境變數

複製 `.env.example` 為 `.env` 依需要調整，詳細說明都寫在該檔案的註解裡。

## 還沒做的事（已知限制，先誠實列出）

- **忘記密碼／Email 通知**：目前沒有寄送 email 的機制（需要額外的 email 服務，例如 Resend／SendGrid，或串接公司既有的 SMTP），密碼重設目前只能請管理員在後台手動處理。
- **金流僅測試環境**：需要完成上面「綠界金流」段落的正式申請流程才能收真實款項。
- **法遵頁面內容**：退換貨政策、隱私權政策等頁面目前還沒有內文（首頁頁尾有連結位置，但內容需要你們或法務提供）。
- **商品資料**：目前是 14 筆示範商品，正式商品目錄（18 大分類、完整品項）需要後續透過後台或批次匯入建立。
- **前台視覺**：如同一開始說的，現在是暫時版型，等 Figma 稿到位後套版。
