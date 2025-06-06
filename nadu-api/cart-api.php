<?php
header('Content-Type: application/json');
require_once 'cors.php';
$conn = connectDB();
function response($success, $data = null, $message = '') {
    echo json_encode(['success' => $success, 'data' => $data, 'message' => $message]);
    exit;
}
$action = $_GET['action'] ?? $_POST['action'] ?? '';
$user_id = intval($_GET['user_id'] ?? $_POST['user_id'] ?? 0);
if (!$user_id) response(false, null, '缺少 user_id');
switch ($action) {
    case 'list':
        $sql = "SELECT c.*, p.name, p.price, p.image FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $cart = [];
        while ($row = $result->fetch_assoc()) {
            $cart[] = $row;
        }
        response(true, ['cart' => $cart]);
        break;
    case 'add':
        $product_id = intval($_POST['product_id'] ?? 0);
        $quantity = intval($_POST['quantity'] ?? 1);
        if (!$product_id) response(false, null, '缺少商品ID');
        // 檢查是否已存在
        $sql = "SELECT * FROM cart WHERE user_id = ? AND product_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('ii', $user_id, $product_id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($row = $result->fetch_assoc()) {
            // 更新數量
            $sql = "UPDATE cart SET quantity = quantity + ? WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param('ii', $quantity, $row['id']);
            $stmt->execute();
        } else {
            $sql = "INSERT INTO cart (user_id, product_id, quantity, created_at) VALUES (?, ?, ?, NOW())";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param('iii', $user_id, $product_id, $quantity);
            $stmt->execute();
        }
        response(true, null, '加入購物車成功');
        break;
    case 'update':
        $id = intval($_POST['id'] ?? 0);
        $quantity = intval($_POST['quantity'] ?? 1);
        if (!$id) response(false, null, '缺少購物車ID');
        $sql = "UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('iii', $quantity, $id, $user_id);
        $stmt->execute();
        response(true, null, '數量已更新');
        break;
    case 'delete':
        $id = intval($_POST['id'] ?? 0);
        if (!$id) response(false, null, '缺少購物車ID');
        $sql = "DELETE FROM cart WHERE id = ? AND user_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('ii', $id, $user_id);
        $stmt->execute();
        response(true, null, '已刪除');
        break;
    case 'clear':
        $sql = "DELETE FROM cart WHERE user_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $user_id);
        $stmt->execute();
        response(true, null, '購物車已清空');
        break;
    default:
        response(false, null, '未知的操作');
}
$conn->close(); 