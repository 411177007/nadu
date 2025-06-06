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
    case 'register':
        $name = $_POST['name'] ?? '';
        $email = $_POST['email'] ?? '';
        $password = $_POST['password'] ?? '';
        $phone = $_POST['phone'] ?? '';
        if (!$name || !$email || !$password) response(false, null, '請填寫所有欄位');
        $sql = "SELECT id FROM users WHERE email = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $stmt->store_result();
        if ($stmt->num_rows > 0) response(false, null, 'Email 已被註冊');
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $sql = "INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('ssss', $name, $email, $hash, $phone);
        if ($stmt->execute()) {
            response(true, ['id' => $conn->insert_id], '註冊成功');
        } else {
            response(false, null, '註冊失敗：' . $conn->error);
        }
        break;
    case 'login':
        $email = $_POST['email'] ?? '';
        $password = $_POST['password'] ?? '';
        if (!$email || !$password) response(false, null, '缺少帳號或密碼');
        $sql = "SELECT * FROM users WHERE email=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();
        if ($user && password_verify($password, $user['password'])) {
            unset($user['password']);
            response(true, $user, '登入成功');
        } else {
            response(false, null, '帳號或密碼錯誤');
        }
        break;
    case 'profile':
        $user_id = intval($_GET['user_id'] ?? 0);
        if (!$user_id) response(false, null, '缺少 user_id');
        $sql = "SELECT id, name, email, phone, created_at FROM users WHERE id=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();
        if ($user) {
            response(true, $user);
        } else {
            response(false, null, '查無會員');
        }
        break;
    case 'list':
        $sql = "SELECT id, name, email, phone, created_at FROM users ORDER BY id DESC";
        $result = $conn->query($sql);
        $users = [];
        while ($row = $result->fetch_assoc()) {
            $users[] = $row;
        }
        response(true, $users);
        break;
    case 'delete':
        $user_id = intval($_POST['user_id'] ?? 0);
        if (!$user_id) response(false, null, '缺少 user_id');
        $sql = "DELETE FROM users WHERE id=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $user_id);
        if ($stmt->execute()) {
            response(true, null, '會員刪除成功');
        } else {
            response(false, null, '會員刪除失敗：' . $conn->error);
        }
        break;
    case 'update':
        $user_id = intval($_POST['user_id'] ?? 0);
        $name = $_POST['name'] ?? '';
        $phone = $_POST['phone'] ?? '';
        if (!$user_id) response(false, null, '缺少 user_id');
        $sql = "UPDATE users SET name=?, phone=? WHERE id=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('ssi', $name, $phone, $user_id);
        if ($stmt->execute()) {
            response(true, null, '會員更新成功');
        } else {
            response(false, null, '會員更新失敗：' . $conn->error);
        }
        break;
    case 'reset_password':
        $user_id = intval($_POST['user_id'] ?? 0);
        $old_password = $_POST['old_password'] ?? '';
        $new_password = $_POST['new_password'] ?? '';
        if (!$user_id || !$old_password || !$new_password) response(false, null, '請填寫所有欄位');
        $sql = "SELECT password FROM users WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $user_id);
        $stmt->execute();
        $stmt->store_result();
        if ($stmt->num_rows === 0) response(false, null, '查無此帳號');
        $stmt->bind_result($db_password);
        $stmt->fetch();
        if (!password_verify($old_password, $db_password)) response(false, null, '舊密碼錯誤');
        $hash = password_hash($new_password, PASSWORD_DEFAULT);
        $sql = "UPDATE users SET password = ? WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('si', $hash, $user_id);
        if ($stmt->execute()) {
            response(true, null, '密碼已重設');
        } else {
            response(false, null, '重設失敗：' . $conn->error);
        }
        break;
    case 'upload_avatar':
        $user_id = intval($_POST['user_id'] ?? 0);
        $avatar = $_POST['avatar'] ?? '';
        if (!$user_id || !$avatar) response(false, null, '缺少 user_id 或 avatar');
        if (!preg_match('/^data:image\/(png|jpg|jpeg);base64,/', $avatar, $matches)) {
            response(false, null, '圖片格式錯誤');
        }
        $ext = $matches[1] === 'jpeg' ? 'jpg' : $matches[1];
        $img_data = substr($avatar, strpos($avatar, ',') + 1);
        $img_data = base64_decode($img_data);
        if ($img_data === false) response(false, null, '圖片解碼失敗');
        $filename = 'avatar_' . $user_id . '_' . time() . '.' . $ext;
        $save_path = __DIR__ . '/images/' . $filename;
        if (!file_put_contents($save_path, $img_data)) {
            response(false, null, '圖片儲存失敗');
        }
        $avatar_path = 'images/' . $filename;
        $sql = "UPDATE users SET avatar=? WHERE id=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('si', $avatar_path, $user_id);
        if ($stmt->execute()) {
            response(true, ['avatar' => $avatar_path], '頭像已更新');
        } else {
            response(false, null, '頭像更新失敗：' . $conn->error);
        }
        break;
    default:
        response(false, null, '未知 action');
}
$conn->close(); 