<?php
/**
 * 資料庫配置檔案範例
 * 
 * 使用說明：
 * 1. 複製此檔案並重新命名為 db-config.php
 * 2. 修改下方的資料庫連接資訊
 * 3. db-config.php 不會被上傳到 Git（已加入 .gitignore）
 */

return [
    'host' => 'localhost',
    'database' => 'nadu_db',
    'username' => 'root',
    'password' => '',  // 請填入您的資料庫密碼
    'charset' => 'utf8mb4',
    
    // JWT Secret Key - 請務必更改為隨機字串
    'jwt_secret' => 'your-secret-key-here-please-change-this-to-random-string',
    
    // CORS 設定
    'allowed_origins' => [
        'http://localhost:3000',
        'http://localhost:3001',
        // 生產環境請加入您的網域
        // 'https://your-domain.com',
    ],
];

