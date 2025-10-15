<?php
/**
 * 資料庫連接檔案
 * 
 * 注意：實際的資料庫密碼應該存放在 db-config.php 中
 * db-config.php 不會被上傳到 Git
 */

// 載入配置檔案
$config_file = __DIR__ . '/db-config.php';

if (file_exists($config_file)) {
    // 如果存在 db-config.php，使用它的設定
    $config = require $config_file;
    $host = $config['host'];
    $db = $config['database'];
    $user = $config['username'];
    $pass = $config['password'];
    $charset = $config['charset'];
} else {
    // 開發環境預設值（僅供本地開發使用）
    $host = 'localhost';
    $db = 'nadu_db';
    $user = 'root';
    $pass = '';  // XAMPP 預設密碼為空
    $charset = 'utf8mb4';
    
    // 警告：請創建 db-config.php 檔案以使用自訂配置
    if (php_sapi_name() !== 'cli') {
        error_log('Warning: db-config.php not found, using default configuration');
    }
}

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    // 不要在錯誤訊息中顯示資料庫密碼
    error_log('Database connection error: ' . $e->getMessage());
    throw new \PDOException('Database connection failed', (int)$e->getCode());
}
