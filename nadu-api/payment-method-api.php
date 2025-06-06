<?php
header('Content-Type: application/json');
require_once 'cors.php';
$host = 'localhost';
$user = 'root';
$pass = '';
$db = 'nadu_db';
$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    echo json_encode(['success'=>false, 'message'=>'資料庫連線失敗']);
    exit;
}
function response($success, $data = null, $message = '') {
    echo json_encode(['success' => $success, 'data' => $data, 'message' => $message]);
    exit;
}
$action = $_GET['action'] ?? $_POST['action'] ?? '';
switch ($action) {
    case 'list':
        $user_id = intval($_GET['user_id'] ?? 0);
        if (!$user_id) response(false, null, '缺少 user_id');
        $sql = "SELECT * FROM payment_methods WHERE user_id=? ORDER BY id DESC";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $methods = [];
        while ($row = $result->fetch_assoc()) {
            $methods[] = $row;
        }
        response(true, $methods);
        break;
    case 'add':
        $user_id = intval($_POST['user_id'] ?? 0);
        $type = $_POST['type'] ?? '';
        $card_number = $_POST['card_number'] ?? '';
        $card_holder = $_POST['card_holder'] ?? '';
        $expire_month = $_POST['expire_month'] ?? '';
        $expire_year = $_POST['expire_year'] ?? '';
        $bank_account = $_POST['bank_account'] ?? '';
        if (!$user_id || !$type) response(false, null, '缺少必要欄位');
        $sql = "INSERT INTO payment_methods (user_id, type, card_number, card_holder, expire_month, expire_year, bank_account) VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('issssss', $user_id, $type, $card_number, $card_holder, $expire_month, $expire_year, $bank_account);
        if ($stmt->execute()) {
            response(true, null, '付款方式已新增');
        } else {
            response(false, null, '新增失敗：' . $conn->error);
        }
        break;
    case 'delete':
        $id = intval($_POST['id'] ?? 0);
        $user_id = intval($_POST['user_id'] ?? 0);
        if (!$id || !$user_id) response(false, null, '缺少 id 或 user_id');
        $sql = "DELETE FROM payment_methods WHERE id=? AND user_id=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('ii', $id, $user_id);
        if ($stmt->execute()) {
            response(true, null, '已刪除');
        } else {
            response(false, null, '刪除失敗：' . $conn->error);
        }
        break;
    default:
        response(false, null, '未知 action');
}
$conn->close(); 