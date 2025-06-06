<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
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
if ($action === 'ann_list') {
    $sql = "SELECT * FROM announcements ORDER BY created_at DESC";
    $result = $conn->query($sql);
    $announcements = [];
    while ($row = $result->fetch_assoc()) {
        $announcements[] = $row;
    }
    response(true, $announcements);
} elseif ($action === 'ann_detail') {
    $id = intval($_GET['id'] ?? $_POST['id'] ?? 0);
    if (!$id) response(false, null, '缺少公告ID');
    $sql = "SELECT * FROM announcements WHERE id=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $ann = $result->fetch_assoc();
    if (!$ann) response(false, null, '查無公告');
    response(true, $ann);
} elseif ($action === 'ann_create') {
    $title = $_POST['title'] ?? '';
    $content = $_POST['content'] ?? '';
    $is_active = intval($_POST['is_active'] ?? 1);
    if (!$title || !$content) response(false, null, '缺少必要欄位');
    $sql = "INSERT INTO announcements (title, content, is_active, created_at) VALUES (?, ?, ?, NOW())";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ssi', $title, $content, $is_active);
    if ($stmt->execute()) {
        response(true, ['id' => $conn->insert_id], '公告新增成功');
    } else {
        response(false, null, '公告新增失敗：' . $conn->error);
    }
} elseif ($action === 'ann_update') {
    $id = intval($_POST['id'] ?? 0);
    $title = $_POST['title'] ?? '';
    $content = $_POST['content'] ?? '';
    $is_active = intval($_POST['is_active'] ?? 1);
    if (!$id) response(false, null, '缺少公告ID');
    $sql = "UPDATE announcements SET title=?, content=?, is_active=? WHERE id=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ssii', $title, $content, $is_active, $id);
    if ($stmt->execute()) {
        response(true, null, '公告更新成功');
    } else {
        response(false, null, '公告更新失敗：' . $conn->error);
    }
} elseif ($action === 'ann_delete') {
    $id = intval($_POST['id'] ?? 0);
    if (!$id) response(false, null, '缺少公告ID');
    $sql = "DELETE FROM announcements WHERE id=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $id);
    if ($stmt->execute()) {
        response(true, null, '公告刪除成功');
    } else {
        response(false, null, '公告刪除失敗：' . $conn->error);
    }
} else {
    // 分類 API
    switch ($action) {
        case 'list':
            // 取得分類列表
            $sql = "SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order ASC, id DESC";
            $result = $conn->query($sql);
            $categories = [];
            while ($row = $result->fetch_assoc()) {
                $categories[] = $row;
            }
            response(true, $categories);
            break;

        case 'detail':
            $id = intval($_GET['id'] ?? 0);
            if (!$id) response(false, null, '缺少分類ID');
            
            $sql = "SELECT * FROM categories WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param('i', $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $category = $result->fetch_assoc();
            
            if (!$category) {
                response(false, null, '查無此分類');
            }
            
            // 取得子分類
            $sql = "SELECT * FROM categories WHERE parent_id = ? AND is_active = 1";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param('i', $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $subcategories = [];
            while ($row = $result->fetch_assoc()) {
                $subcategories[] = $row;
            }
            
            $category['subcategories'] = $subcategories;
            response(true, $category);
            break;

        case 'create':
            $name = $_POST['name'] ?? '';
            $description = $_POST['description'] ?? '';
            $image = $_POST['image'] ?? '';
            $parent_id = intval($_POST['parent_id'] ?? 0);
            $sort_order = intval($_POST['sort_order'] ?? 0);
            $is_active = intval($_POST['is_active'] ?? 1);

            if (!$name) response(false, null, '分類名稱不能為空');

            $image_path = '';
            if ($image && preg_match('/^data:image\\/(png|jpg|jpeg);base64,/', $image, $matches)) {
                $ext = $matches[1] === 'jpeg' ? 'jpg' : $matches[1];
                $img_data = substr($image, strpos($image, ',') + 1);
                $img_data = base64_decode($img_data);
                if ($img_data !== false) {
                    $filename = 'category_' . time() . '_' . rand(1000,9999) . '.' . $ext;
                    $save_path = __DIR__ . '/images/' . $filename;
                    if (file_put_contents($save_path, $img_data)) {
                        $image_path = 'images/' . $filename;
                    }
                }
            }

            $sql = "INSERT INTO categories (name, description, image, parent_id, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param('sssiii', $name, $description, $image_path, $parent_id, $sort_order, $is_active);

            if ($stmt->execute()) {
                response(true, ['id' => $conn->insert_id], '分類建立成功');
            } else {
                response(false, null, '分類建立失敗：' . $conn->error);
            }
            break;

        case 'update':
            $id = intval($_POST['id'] ?? 0);
            $name = $_POST['name'] ?? '';
            $description = $_POST['description'] ?? '';
            $image = $_POST['image'] ?? '';
            $parent_id = intval($_POST['parent_id'] ?? 0);
            $sort_order = intval($_POST['sort_order'] ?? 0);
            $is_active = intval($_POST['is_active'] ?? 1);

            if (!$id) response(false, null, '缺少分類ID');
            if (!$name) response(false, null, '分類名稱不能為空');

            // 檢查是否將分類設為自己的子分類
            if ($id == $parent_id) {
                response(false, null, '不能將分類設為自己的子分類');
            }

            $image_path = '';
            if ($image && preg_match('/^data:image\\/(png|jpg|jpeg);base64,/', $image, $matches)) {
                $ext = $matches[1] === 'jpeg' ? 'jpg' : $matches[1];
                $img_data = substr($image, strpos($image, ',') + 1);
                $img_data = base64_decode($img_data);
                if ($img_data !== false) {
                    $filename = 'category_' . time() . '_' . rand(1000,9999) . '.' . $ext;
                    $save_path = __DIR__ . '/images/' . $filename;
                    if (file_put_contents($save_path, $img_data)) {
                        $image_path = 'images/' . $filename;
                    }
                }
            }

            $sql = "UPDATE categories SET name=?, description=?, image=?, parent_id=?, sort_order=?, is_active=? WHERE id=?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param('sssiiii', $name, $description, $image_path, $parent_id, $sort_order, $is_active, $id);

            if ($stmt->execute()) {
                response(true, null, '分類更新成功');
            } else {
                response(false, null, '分類更新失敗：' . $conn->error);
            }
            break;

        case 'delete':
            $id = intval($_POST['id'] ?? 0);
            if (!$id) response(false, null, '缺少分類ID');

            // 檢查是否有子分類
            $sql = "SELECT COUNT(*) as count FROM categories WHERE parent_id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param('i', $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $row = $result->fetch_assoc();

            if ($row['count'] > 0) {
                response(false, null, '請先刪除子分類');
            }

            // 檢查是否有關聯的商品
            $sql = "SELECT COUNT(*) as count FROM products WHERE category_id = ? AND deleted = 0";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param('i', $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $row = $result->fetch_assoc();

            if ($row['count'] > 0) {
                response(false, null, '請先移除該分類下的商品');
            }

            $sql = "DELETE FROM categories WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param('i', $id);

            if ($stmt->execute()) {
                response(true, null, '分類刪除成功');
            } else {
                response(false, null, '分類刪除失敗：' . $conn->error);
            }
            break;

        case 'tree':
            // 取得分類樹狀結構
            function buildCategoryTree($parent_id = 0) {
                global $conn;
                $sql = "SELECT * FROM categories WHERE parent_id = ? AND is_active = 1 ORDER BY sort_order ASC, id DESC";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param('i', $parent_id);
                $stmt->execute();
                $result = $stmt->get_result();
                $categories = [];
                
                while ($row = $result->fetch_assoc()) {
                    $row['children'] = buildCategoryTree($row['id']);
                    $categories[] = $row;
                }
                
                return $categories;
            }
            
            $tree = buildCategoryTree();
            response(true, $tree);
            break;

        default:
            response(false, null, '未知的操作');
    }
}
$conn->close();
?> 