<?php
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);
header('Content-Type: application/json');
require_once 'cors.php';

$conn = connectDB();

function response($success, $data = null, $message = '') {
    echo json_encode(['success' => $success, 'data' => $data, 'message' => $message]);
    exit;
}

function generateOrderNumber() {
    return date('Ymd') . str_pad(mt_rand(1, 99999), 5, '0', STR_PAD_LEFT);
}

$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch ($action) {
    case 'create':
        // 建立訂單
        $user_id = intval($_POST['user_id'] ?? 0);
        if (!$user_id) response(false, null, '請先登入');
        
        // 檢查購物車是否為空
        $sql = "SELECT c.*, p.name, p.price, p.stock 
                FROM cart c 
                JOIN products p ON c.product_id = p.id 
                WHERE c.user_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $cart_items = [];
        $total_amount = 0;
        
        while ($item = $result->fetch_assoc()) {
            // 檢查庫存
            if ($item['stock'] < $item['quantity']) {
                response(false, null, "商品 {$item['name']} 庫存不足");
            }
            $cart_items[] = $item;
            $total_amount += $item['price'] * $item['quantity'];
        }
        
        if (empty($cart_items)) {
            response(false, null, '購物車是空的');
        }
        
        // 驗證收件資訊
        $required_fields = ['shipping_name', 'shipping_phone', 'shipping_address'];
        foreach ($required_fields as $field) {
            if (!isset($_POST[$field]) || trim($_POST[$field]) === '') {
                response(false, null, "請填寫 $field");
            }
        }
        
        $shipping_name = $_POST['shipping_name'];
        $shipping_phone = $_POST['shipping_phone'];
        $shipping_address = $_POST['shipping_address'];
        $note = $_POST['note'] ?? '';
        $payment_method = $_POST['payment_method'] ?? 'credit_card';
        $shipping_fee = 60; // 固定運費
        $order_number = generateOrderNumber();
        
        try {
            $conn->begin_transaction();
            
            // 建立訂單
            $sql = "INSERT INTO orders (user_id, order_number, total_amount, shipping_fee,
                    shipping_name, shipping_phone, shipping_address, note, payment_method)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param('iiddsssss', $user_id, $order_number, $total_amount, $shipping_fee,
                            $shipping_name, $shipping_phone, $shipping_address, $note, $payment_method);
            $stmt->execute();
            $order_id = $conn->insert_id;
            
            // 建立訂單項目
            $sql = "INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, subtotal)
                    VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            
            foreach ($cart_items as $item) {
                $subtotal = $item['price'] * $item['quantity'];
                $stmt->bind_param('iisdid', $order_id, $item['product_id'], $item['name'],
                                $item['price'], $item['quantity'], $subtotal);
                $stmt->execute();
                
                // 更新庫存
                $new_stock = $item['stock'] - $item['quantity'];
                $sql2 = "UPDATE products SET stock = ? WHERE id = ?";
                $stmt2 = $conn->prepare($sql2);
                $stmt2->bind_param('ii', $new_stock, $item['product_id']);
                $stmt2->execute();
            }
            
            // 清空購物車
            $sql = "DELETE FROM cart WHERE user_id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param('i', $user_id);
            $stmt->execute();
            
            $conn->commit();
            response(true, ['order_id' => $order_id, 'order_number' => $order_number], '訂單建立成功');
            
        } catch (Exception $e) {
            $conn->rollback();
            error_log('order-api.php error: ' . $e->getMessage());
            response(false, null, '訂單建立失敗：' . $e->getMessage());
        }
        break;

    case 'list':
        // 取得訂單列表
        $user_id = intval($_GET['user_id'] ?? 0);
        $page = intval($_GET['page'] ?? 1);
        $limit = intval($_GET['limit'] ?? 10);
        $offset = ($page - 1) * $limit;
        
        // 基礎 SQL
        $sql = "SELECT * FROM orders WHERE 1=1";
        $count_sql = "SELECT COUNT(*) as total FROM orders WHERE 1=1";
        
        // 如果不是管理員，只能看到自己的訂單
        if ($user_id) {
            $sql .= " AND user_id = $user_id";
            $count_sql .= " AND user_id = $user_id";
        }
        
        // 取得總數
        $count_result = $conn->query($count_sql);
        $total = $count_result->fetch_assoc()['total'];
        
        // 加入排序和分頁
        $sql .= " ORDER BY created_at DESC LIMIT $offset, $limit";
        
        $result = $conn->query($sql);
        $orders = [];
        while ($order = $result->fetch_assoc()) {
            $orders[] = $order;
        }
        
        response(true, [
            'orders' => $orders,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => ceil($total / $limit)
        ]);
        break;

    case 'detail':
        // 取得訂單詳情
        $order_id = intval($_GET['id'] ?? 0);
        $user_id = intval($_GET['user_id'] ?? 0);
        
        if (!$order_id) response(false, null, '缺少訂單ID');
        
        // 取得訂單基本資訊
        $sql = "SELECT * FROM orders WHERE id = ?";
        if ($user_id) {
            $sql .= " AND user_id = $user_id";
        }
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $order_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $order = $result->fetch_assoc();
        
        if (!$order) {
            response(false, null, '查無此訂單');
        }
        
        // 取得訂單項目
        $sql = "SELECT * FROM order_items WHERE order_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $order_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $items = [];
        while ($item = $result->fetch_assoc()) {
            $items[] = $item;
        }
        
        $order['items'] = $items;
        response(true, $order);
        break;

    case 'update_status':
        // 更新訂單狀態（管理員功能）
        $order_id = intval($_POST['id'] ?? 0);
        $status = $_POST['status'] ?? '';
        $payment_status = $_POST['payment_status'] ?? '';
        
        if (!$order_id) response(false, null, '缺少訂單ID');
        if (!$status && !$payment_status) response(false, null, '請指定要更新的狀態');
        
        $updates = [];
        $types = '';
        $values = [];
        
        if ($status) {
            $updates[] = "status = ?";
            $types .= 's';
            $values[] = $status;
        }
        
        if ($payment_status) {
            $updates[] = "payment_status = ?";
            $types .= 's';
            $values[] = $payment_status;
        }
        
        $values[] = $order_id;
        $types .= 'i';
        
        $sql = "UPDATE orders SET " . implode(', ', $updates) . " WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$values);
        
        if ($stmt->execute()) {
            response(true, null, '訂單狀態更新成功');
        } else {
            response(false, null, '訂單狀態更新失敗');
        }
        break;

    case 'cancel':
        // 取消訂單
        $order_id = intval($_POST['id'] ?? 0);
        $user_id = intval($_POST['user_id'] ?? 0);
        
        if (!$order_id || !$user_id) response(false, null, '缺少必要參數');
        
        // 檢查訂單是否屬於該用戶
        $sql = "SELECT * FROM orders WHERE id = ? AND user_id = ? AND status = 'pending'";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('ii', $order_id, $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $order = $result->fetch_assoc();
        
        if (!$order) {
            response(false, null, '無法取消此訂單');
        }
        
        try {
            $conn->begin_transaction();
            
            // 更新訂單狀態
            $sql = "UPDATE orders SET status = 'cancelled' WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param('i', $order_id);
            $stmt->execute();
            
            // 恢復庫存
            $sql = "SELECT * FROM order_items WHERE order_id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param('i', $order_id);
            $stmt->execute();
            $result = $stmt->get_result();
            
            while ($item = $result->fetch_assoc()) {
                $sql = "UPDATE products SET stock = stock + ? WHERE id = ?";
                $stmt2 = $conn->prepare($sql);
                $stmt2->bind_param('ii', $item['quantity'], $item['product_id']);
                $stmt2->execute();
            }
            
            $conn->commit();
            response(true, null, '訂單已取消');
            
        } catch (Exception $e) {
            $conn->rollback();
            response(false, null, '訂單取消失敗：' . $e->getMessage());
        }
        break;

    default:
        response(false, null, '未知的操作');
}

$conn->close();
?> 