<?php
if (ob_get_level()) ob_clean();
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(0);
header('Content-Type: application/json');
require_once 'cors.php';

$conn = connectDB();
if (!$conn) {
    response(false, null, 'DB connect error: ' . mysqli_connect_error());
}

function response($success, $data = null, $message = '') {
    echo json_encode(['success' => $success, 'data' => $data, 'message' => $message]);
    exit;
}

$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch ($action) {
    case 'list':
        $category_id = intval($_GET['category_id'] ?? 0);
        $category_name = $_GET['category_name'] ?? '';
        $page = intval($_GET['page'] ?? 1);
        $limit = intval($_GET['limit'] ?? 10);
        $offset = ($page - 1) * $limit;
        $search = $_GET['search'] ?? '';
        $sort = $_GET['sort'] ?? 'created_at';
        $order = $_GET['order'] ?? 'DESC';
        $status = $_GET['status'] ?? '';
        
        // 建立基礎 SQL
        $sql = "SELECT p.*, c.name as category_name 
                FROM products p 
                LEFT JOIN categories c ON p.category_id = c.id 
                WHERE 1=1 AND p.deleted=0";
        
        // 加入搜尋條件
        if ($category_id) {
            $sql .= " AND p.category_id = $category_id";
        }
        if ($category_name) {
            $category_name = $conn->real_escape_string($category_name);
            $sql .= " AND c.name = '$category_name'";
        }
        if ($search) {
            $search = $conn->real_escape_string($search);
            $sql .= " AND (p.name LIKE '%$search%' OR p.description LIKE '%$search%')";
        }
        if ($status && $status !== 'all') {
            $sql .= " AND p.status = '" . $conn->real_escape_string($status) . "'";
        }
        
        // 計算總數
        $count_sql = "SELECT COUNT(*) as total FROM ($sql) as t";
        $count_result = $conn->query($count_sql);
        $total = $count_result->fetch_assoc()['total'];
        
        // 加入排序和分頁
        $sql .= " ORDER BY p.$sort $order LIMIT $offset, $limit";
        
        $result = $conn->query($sql);
        $products = [];
        while ($row = $result->fetch_assoc()) {
            if ($row['images']) {
                $row['images'] = json_decode($row['images'], true);
            }
            $products[] = $row;
        }
        
        response(true, [
            'products' => $products,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => ceil($total / $limit)
        ]);
        break;

    case 'detail':
        $id = intval($_GET['id'] ?? 0);
        if (!$id) response(false, null, '缺少商品ID');
        
        $sql = "SELECT p.*, c.name as category_name 
                FROM products p 
                LEFT JOIN categories c ON p.category_id = c.id 
                WHERE p.id = ? AND p.deleted=0";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $product = $result->fetch_assoc();
        
        if (!$product) {
            response(false, null, '查無此商品');
        }
        
        if ($product['images']) {
            $product['images'] = json_decode($product['images'], true);
        }
        
        response(true, $product);
        break;

    case 'create':
        // 1. 取得欄位
        $name = $_POST['name'] ?? '';
        $category_id = $_POST['category_id'] ?? '';
        $price = $_POST['price'] ?? '';
        $original_price = $_POST['original_price'] ?? '';
        $stock = $_POST['stock'] ?? '';
        $status = $_POST['status'] ?? 'published';
        $description = $_POST['description'] ?? '';
        $image = $_POST['image'] ?? '';

        // 2. 欄位檢查
        if (!$name) response(false, null, '缺少商品名稱');
        if (!$category_id) response(false, null, '缺少分類');
        if (!$price) response(false, null, '缺少價格');
        if (!$original_price) response(false, null, '缺少原價');
        if (!$stock) response(false, null, '缺少庫存');
        if (!$description) response(false, null, '缺少描述');

        // 3. 圖片處理
        $image_path = '';
        if ($image && preg_match('/^data:image\\/(png|jpg|jpeg);base64,/', $image, $matches)) {
            $ext = $matches[1] === 'jpeg' ? 'jpg' : $matches[1];
            $img_data = substr($image, strpos($image, ',') + 1);
            $img_data = base64_decode($img_data);
            if ($img_data === false) response(false, null, '圖片解碼失敗');
            $filename = 'product_' . time() . '_' . rand(1000,9999) . '.' . $ext;
            $save_path = __DIR__ . '/images/' . $filename;
            if (!file_put_contents($save_path, $img_data)) {
                response(false, null, '圖片儲存失敗');
            }
            $image_path = 'images/' . $filename;
        }

        // 4. 寫入資料庫
        $stmt = $conn->prepare("INSERT INTO products (name, category_id, price, original_price, stock, status, image, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("siddisss", $name, $category_id, $price, $original_price, $stock, $status, $image_path, $description);
        if ($stmt->execute()) {
            response(true, null, '新增成功');
        } else {
            response(false, null, '資料庫寫入失敗: ' . $stmt->error);
        }
        break;

    case 'update':
        try {
        $id = intval($_POST['id'] ?? 0);
            $name = $_POST['name'] ?? '';
            $category_id = intval($_POST['category_id'] ?? 0);
            $price = floatval($_POST['price'] ?? 0);
            $original_price = floatval($_POST['original_price'] ?? 0);
            $stock = intval($_POST['stock'] ?? 0);
            $status = $_POST['status'] ?? '';
            $image = $_POST['image'] ?? '';
            $description = $_POST['description'] ?? '';
            if (!$id || $name === '' || !$category_id || $price === '' || $original_price === '' || $stock === '') {
                response(false, null, '請填寫所有必填欄位');
            }
            // 新增：處理 base64 圖片
            $image_path = $image;
            if ($image && preg_match('/^data:image\/(png|jpg|jpeg);base64,/', $image, $matches)) {
                $ext = $matches[1] === 'jpeg' ? 'jpg' : $matches[1];
                $img_data = substr($image, strpos($image, ',') + 1);
                $img_data = base64_decode($img_data);
                if ($img_data === false) {
                    response(false, null, '圖片解碼失敗');
                }
                $filename = 'product_' . time() . '_' . rand(1000,9999) . '.' . $ext;
                $save_path = __DIR__ . '/images/' . $filename;
                if (!file_put_contents($save_path, $img_data)) {
                    response(false, null, '圖片儲存失敗');
        }
                $image_path = 'images/' . $filename;
            }
            $sql = "UPDATE products SET name=?, category_id=?, price=?, original_price=?, stock=?, status=?, image=?, description=? WHERE id=?";
        $stmt = $conn->prepare($sql);
            if (!$stmt) {
                response(false, null, 'SQL 準備失敗: ' . $conn->error);
            }
            $stmt->bind_param('siddssssi', $name, $category_id, $price, $original_price, $stock, $status, $image_path, $description, $id);
        if ($stmt->execute()) {
                response(true, null, '更新成功');
        } else {
                response(false, null, '更新失敗: ' . $stmt->error);
            }
        } catch (Throwable $e) {
            response(false, null, 'PHP錯誤: ' . $e->getMessage());
        }
        break;

    case 'delete':
        $id = intval($_POST['id'] ?? 0);
        if (!$id) response(false, null, '缺少商品ID');
        // 刪除購物車中的相關項目
        $sql = "DELETE FROM cart WHERE product_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $id);
        $stmt->execute();
        // 軟刪除商品
        $sql = "UPDATE products SET deleted=1 WHERE id=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $id);
        if ($stmt->execute()) {
            response(true, null, '商品刪除成功');
        } else {
            response(false, null, '商品刪除失敗：' . $conn->error);
        }
        break;

    case 'featured':
        // 取得精選商品
        $limit = intval($_GET['limit'] ?? 6);
        $sql = "SELECT p.*, c.name as category_name 
                FROM products p 
                LEFT JOIN categories c ON p.category_id = c.id 
                WHERE p.status = 'published' AND p.is_featured = 1 AND p.deleted=0 
                ORDER BY p.created_at DESC 
                LIMIT ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $limit);
        $stmt->execute();
        $result = $stmt->get_result();
        $products = [];
        while ($row = $result->fetch_assoc()) {
            if ($row['images']) {
                $row['images'] = json_decode($row['images'], true);
            }
            $products[] = $row;
        }
        response(true, $products);
        break;

    case 'search':
        $keyword = $_GET['keyword'] ?? '';
        $sql = "SELECT * FROM products WHERE status='published' AND (name LIKE ? OR description LIKE ?) AND deleted=0 ORDER BY created_at DESC LIMIT 50";
        $like = "%$keyword%";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('ss', $like, $like);
        $stmt->execute();
        $result = $stmt->get_result();
        $products = [];
        while ($row = $result->fetch_assoc()) {
            $products[] = $row;
        }
        response(true, ['products' => $products]);
        break;

    case 'add_review':
        $user_id = intval($_POST['user_id'] ?? 0);
        $product_id = intval($_POST['product_id'] ?? 0);
        $rating = intval($_POST['rating'] ?? 0);
        $comment = $_POST['comment'] ?? '';
        if (!$user_id || !$product_id || !$rating) response(false, null, '缺少必要欄位');
        $stmt = $conn->prepare("INSERT INTO product_reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)");
        $stmt->bind_param('iiis', $product_id, $user_id, $rating, $comment);
        if ($stmt->execute()) {
            response(true, null, '評價已送出');
        } else {
            response(false, null, '評價失敗: ' . $conn->error);
        }
        break;

    case 'list_reviews':
        $product_id = intval($_GET['product_id'] ?? 0);
        if (!$product_id) response(false, null, '缺少商品ID');
        $sql = "SELECT r.*, u.name as user_name FROM product_reviews r JOIN users u ON r.user_id = u.id WHERE r.product_id = ? ORDER BY r.created_at DESC";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $product_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $reviews = [];
        while ($row = $result->fetch_assoc()) {
            $reviews[] = $row;
        }
        response(true, ['reviews' => $reviews]);
        break;

    default:
        response(false, null, '未知的操作');
}

$conn->close();

// 處理 base64 圖片上傳
function saveBase64Image($base64_data, $filename) {
    $image_dir = __DIR__ . "/images";
    
    // 確保圖片目錄存在
    if (!file_exists($image_dir)) {
        mkdir($image_dir, 0755, true);
    }
    
    // 檢查 base64 字串是否有效
    if (!$base64_data || !preg_match('/^data:image\/(\w+);base64,/', $base64_data, $type)) {
        return ["success" => false, "error" => "Invalid base64 image data"];
    }
    
    // 提取 base64 編碼部分
    $base64_data = substr($base64_data, strpos($base64_data, ',') + 1);
    $data = base64_decode($base64_data);
    
    if ($data === false) {
        return ["success" => false, "error" => "Failed to decode base64 data"];
    }
    
    // 確保檔名安全
    $filename = preg_replace('/[^a-zA-Z0-9_\-\.]/', '', $filename);
    $file_path = $image_dir . '/' . $filename;
    
    // 保存檔案
    $result = file_put_contents($file_path, $data);
    if ($result !== false) {
        return ["success" => true, "filename" => $filename, "bytes" => $result];
    }
    
    return ["success" => false, "error" => "Failed to write file", "path" => $file_path];
}
?> 