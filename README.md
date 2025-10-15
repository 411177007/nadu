# Nadu Official Store - 電商網站系統

> 一個功能完整的電商網站，包含前台購物、後台管理、會員系統、訂單管理等功能。

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![PHP](https://img.shields.io/badge/PHP-8.2-purple)](https://www.php.net/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)](https://www.mysql.com/)

---

## 📸 專案展示

### 前台功能
- 🛍️ 商品瀏覽與搜尋
- 🛒 購物車管理
- 👤 會員註冊/登入
- 📦 訂單管理
- 🎨 深色/淺色主題切換

### 後台功能
- 📊 數據分析儀表板
- 🏷️ 商品管理（新增/編輯/刪除）
- 📋 訂單管理
- 👥 會員管理
- 🗂️ 分類管理

---

## 🚀 快速開始

### 前置需求

- **XAMPP** (Apache + MySQL)
- **Node.js** (v18 或以上)
- **pnpm** (推薦) 或 npm

### 安裝步驟

#### 1. 克隆專案

```bash
git clone https://github.com/你的用戶名/nadu.git
cd nadu
```

#### 2. 啟動 XAMPP

打開 XAMPP Control Panel，啟動：
- ✅ Apache
- ✅ MySQL

#### 3. 建立資料庫

1. 訪問 phpMyAdmin：http://localhost/phpmyadmin
2. 創建新資料庫：`nadu_db`
3. 選擇 `nadu_db` 資料庫
4. 點擊「匯入」
5. 選擇 `nadu-api/db-schema.sql` 文件
6. 點擊「執行」

#### 4. 安裝前端依賴

```bash
cd nadu-website
pnpm install
```

#### 5. 啟動前端開發伺服器

```bash
pnpm dev
```

#### 6. 訪問網站

- **前端網站**：http://localhost:3000
- **後台管理**：http://localhost:3000/admin
- **phpMyAdmin**：http://localhost/phpmyadmin

---

## 📁 專案結構

```
nadu/
├── nadu-website/              # Next.js 前端
│   ├── app/                  # App Router 頁面
│   │   ├── (frontend)/      # 前台頁面
│   │   └── admin/           # 後台頁面
│   ├── components/          # React 組件
│   │   └── ui/             # UI 組件庫
│   ├── lib/                # 工具函數與 API
│   └── public/             # 靜態資源
│
├── nadu-api/                 # PHP 後端 API
│   ├── admin-auth-api.php   # 管理員認證
│   ├── analytics-api.php    # 數據分析
│   ├── cart-api.php         # 購物車
│   ├── category-api.php     # 分類管理
│   ├── order-api.php        # 訂單管理
│   ├── product-api.php      # 商品管理
│   ├── users-api.php        # 用戶管理
│   ├── db.php               # 資料庫連接
│   ├── cors.php             # CORS 設定
│   └── db-schema.sql        # 資料庫結構
│
├── README.md                 # 專案說明
├── LICENSE                   # MIT 授權
└── XAMPP_啟動指南.md         # 詳細啟動指南
```

---

## 🛠️ 技術棧

### 前端
- **框架**：Next.js 15 (App Router)
- **UI 庫**：React 19
- **語言**：TypeScript
- **樣式**：Tailwind CSS
- **圖表**：Recharts
- **組件**：Radix UI
- **圖標**：Lucide React

### 後端
- **語言**：PHP 8.2
- **資料庫**：MySQL 8.0
- **API**：RESTful API
- **認證**：JWT (JSON Web Tokens)

### 開發環境
- **本地伺服器**：XAMPP
- **包管理器**：pnpm

---

## 🎯 主要功能

### 前台功能

#### 1. 商品瀏覽
- 商品列表展示
- 分類篩選
- 搜尋功能
- 商品詳情頁

#### 2. 購物車
- 加入購物車
- 數量調整
- 商品移除
- 即時計算總價

#### 3. 會員系統
- 會員註冊
- 登入/登出
- 個人資料管理
- 訂單歷史查詢

#### 4. 訂單管理
- 建立訂單
- 訂單狀態追蹤
- 訂單詳情查看

### 後台功能

#### 1. 儀表板
- 總銷售額統計
- 訂單數量
- 會員數量
- 商品數量
- 銷售趨勢圖表
- 熱門商品排行

#### 2. 商品管理
- 新增商品
- 編輯商品資訊
- 刪除商品
- 商品狀態管理
- 庫存管理

#### 3. 訂單管理
- 訂單列表
- 訂單詳情
- 訂單狀態更新
- 訂單搜尋

#### 4. 會員管理
- 會員列表
- 會員資料查看
- 會員狀態管理

#### 5. 分類管理
- 新增分類
- 編輯分類
- 刪除分類
- 分類排序

---

## 🔐 安全性

### 已實施的安全措施

✅ **密碼加密**：使用 PHP `password_hash()` 函數  
✅ **SQL 注入防護**：使用 PDO Prepared Statements  
✅ **XSS 防護**：輸出過濾與轉義  
✅ **CORS 設定**：限制跨域請求  
✅ **JWT 認證**：管理員登入使用 JWT Token  
✅ **環境變數**：敏感資訊使用環境變數管理  

### 部署前注意事項

⚠️ **重要**：上線前請務必：
1. 修改資料庫密碼
2. 更換 JWT Secret Key
3. 設定正確的 CORS 來源
4. 啟用 HTTPS
5. 定期備份資料庫

---

## 📊 資料庫設定

### 預設配置

```
主機: localhost
資料庫: nadu_db
用戶: root
密碼: (空白)
```

### 資料表結構

- `users` - 用戶資料
- `products` - 商品資料
- `categories` - 商品分類
- `orders` - 訂單資料
- `order_items` - 訂單項目
- `cart` - 購物車
- `payment_methods` - 付款方式
- `hero_image` - 首頁輪播圖
- `product_reviews` - 商品評價
- `admin_users` - 管理員帳號

---

## 💻 開發指令

```bash
# 安裝依賴
cd nadu-website
pnpm install

# 開發模式（熱重載）
pnpm dev

# 建置生產版本
pnpm build

# 啟動生產版本
pnpm start

# 程式碼檢查
pnpm lint
```

---

## 🎨 UI/UX 特色

- ✅ **響應式設計**：支援手機、平板、桌面
- ✅ **深色模式**：自動適應系統主題
- ✅ **流暢動畫**：使用 Tailwind 動畫
- ✅ **直觀介面**：清晰的導航與操作流程
- ✅ **無障礙設計**：符合 WCAG 標準

---

## 📝 API 文檔

### 商品 API

```
GET  /nadu-api/product-api.php?action=list          # 取得商品列表
GET  /nadu-api/product-api.php?action=get&id={id}   # 取得單一商品
POST /nadu-api/product-api.php?action=create        # 新增商品
POST /nadu-api/product-api.php?action=update        # 更新商品
POST /nadu-api/product-api.php?action=delete        # 刪除商品
```

### 分類 API

```
GET  /nadu-api/category-api.php?action=list         # 取得分類列表
POST /nadu-api/category-api.php?action=create       # 新增分類
POST /nadu-api/category-api.php?action=update       # 更新分類
POST /nadu-api/category-api.php?action=delete       # 刪除分類
```

### 訂單 API

```
GET  /nadu-api/order-api.php?action=list            # 取得訂單列表
GET  /nadu-api/order-api.php?action=get&id={id}     # 取得訂單詳情
POST /nadu-api/order-api.php?action=create          # 建立訂單
POST /nadu-api/order-api.php?action=update          # 更新訂單狀態
```

### 購物車 API

```
GET  /nadu-api/cart-api.php?action=list&user_id={id}    # 取得購物車
POST /nadu-api/cart-api.php?action=add                  # 加入購物車
POST /nadu-api/cart-api.php?action=update               # 更新數量
POST /nadu-api/cart-api.php?action=remove               # 移除商品
```

---

## 🐛 常見問題

### Q: 前端顯示「載入中...」？
**A**: 確認 XAMPP 的 Apache 和 MySQL 都已啟動，並檢查資料庫是否已正確匯入。

### Q: API 錯誤？
**A**: 檢查 `nadu-api/db.php` 中的資料庫連接設定是否正確。

### Q: Port 被佔用？
**A**: 確認沒有其他程式佔用 3000 (前端) 或 80 (Apache) port。

### Q: 圖片無法顯示？
**A**: 確認 `nadu-api/images/` 目錄存在且有寫入權限。

---

## 🤝 貢獻

歡迎提交 Issue 或 Pull Request！

---

## 📄 授權

本專案採用 [MIT License](LICENSE)

---

## 👨‍💻 作者

**Nadu Development Team**

---

## 🙏 致謝

感謝所有開源專案的貢獻者：
- Next.js Team
- React Team
- Tailwind CSS
- Radix UI
- 以及所有依賴套件的維護者

---

## 📞 聯絡方式

如有任何問題或建議，歡迎聯絡：
- Email: your-email@example.com
- GitHub Issues: [提交問題](https://github.com/你的用戶名/nadu/issues)

---

**⭐ 如果這個專案對您有幫助，請給我們一個 Star！**
