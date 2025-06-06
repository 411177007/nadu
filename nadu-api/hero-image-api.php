<?php
header('Content-Type: application/json');
require_once 'cors.php';
$conn = connectDB();
function response($success, $data = null, $message = '') {
    echo json_encode(['success' => $success, 'data' => $data, 'message' => $message]);
    exit;
}
$action = $_GET['action'] ?? $_POST['action'] ?? '';
switch ($action) {
    case 'get':
        $sql = "SELECT image_path FROM hero_image ORDER BY id DESC LIMIT 1";
        $result = $conn->query($sql);
        $row = $result->fetch_assoc();
        $image = $row ? $row['image_path'] : null;
        response(true, ['image' => $image]);
        break;
    case 'upload':
        $image = $_POST['image'] ?? '';
        if (!$image || !preg_match('/^data:image\//', $image)) response(false, null, '缺少圖片資料');
        $ext = 'jpg';
        if (preg_match('/^data:image\/(\w+);/', $image, $matches)) {
            $ext = $matches[1];
        }
        $img_data = preg_replace('/^data:image\/(\w+);base64,/', '', $image);
        $img_data = base64_decode($img_data);
        $filename = uniqid('hero_', true) . '.' . $ext;
        $img_path = __DIR__ . '/images/' . $filename;
        file_put_contents($img_path, $img_data);
        $db_path = 'images/' . $filename;
        $sql = "INSERT INTO hero_image (image_path, created_at) VALUES (?, NOW())";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('s', $db_path);
        $stmt->execute();
        response(true, ['image' => $db_path], '圖片上傳成功');
        break;
    default:
        response(false, null, '未知的操作');
}
$conn->close(); 