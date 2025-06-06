<?php
// CORS 設置文件
// 在各個 API 文件中先引入這個文件，以確保所有 API 都有一致的 CORS 設置

// 允許從任何來源訪問（在生產環境中可以限制特定域名）
header("Access-Control-Allow-Origin: *");

// 允許的 HTTP 請求方法
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH");

// 允許的請求頭
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin");

// 允許憑證 (cookies)
header("Access-Control-Allow-Credentials: true");

// 設置預檢請求的快取時間 (20天)
header("Access-Control-Max-Age: 1728000");

// 響應的內容類型
header("Content-Type: application/json; charset=UTF-8");

// 處理 OPTIONS 請求（預檢請求）
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // 返回 200 OK 並終止腳本執行
    http_response_code(200);
    exit(0);
}

// 開啟錯誤報告（可在需要時關閉）
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

/**
 * 標準化響應函數
 * 
 * @param bool $success 是否成功
 * @param mixed $data 響應數據
 * @param string $message 響應消息
 * @param int $status_code HTTP 狀態碼
 * @return void
 */
function sendResponse($success, $data = null, $message = '', $status_code = 200) {
    // 設置 HTTP 狀態碼
    http_response_code($status_code);
    
    // 構建響應數據
    $response = [
        'success' => $success
    ];
    
    if (!empty($message)) {
        $response['message'] = $message;
    }
    
    if ($data !== null) {
        $response['data'] = $data;
    }
    
    // 輸出 JSON 響應
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * 發送錯誤響應
 * 
 * @param string $message 錯誤消息
 * @param int $status_code HTTP 狀態碼
 * @param mixed $data 額外的錯誤數據
 * @return void
 */
function sendErrorResponse($message, $status_code = 400, $data = null) {
    sendResponse(false, $data, $message, $status_code);
}

/**
 * 發送成功響應
 * 
 * @param mixed $data 響應數據
 * @param string $message 成功消息
 * @return void
 */
function sendSuccessResponse($data = null, $message = '') {
    sendResponse(true, $data, $message);
}

/**
 * 檢查必要的請求參數
 * 
 * @param array $required_fields 必要欄位列表
 * @param array $data 請求數據
 * @return bool 是否通過檢查
 */
function validateRequiredFields($required_fields, $data) {
    foreach ($required_fields as $field) {
        if (!isset($data[$field]) || (is_string($data[$field]) && trim($data[$field]) === '')) {
            sendErrorResponse("缺少必要欄位: $field");
            return false;
        }
    }
    return true;
}

/**
 * 標準化資料庫連接
 * 
 * @return mysqli 資料庫連接實例
 */
function connectDB() {
    // 資料庫設置
    $db_host = "localhost";
    $db_user = "root";
    $db_pass = "";
    $db_name = "nadu_db";
    
    // 建立連接
    $conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
    
    // 檢查連接
    if ($conn->connect_error) {
        sendErrorResponse("資料庫連接失敗: " . $conn->connect_error, 500);
        exit;
    }
    
    // 設置字符集
    $conn->set_charset("utf8mb4");
    
    return $conn;
}
?> 