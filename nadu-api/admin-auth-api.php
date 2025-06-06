<?php
require_once 'cors.php';
require_once 'db.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: *');

// JWT functions
function generate_jwt($payload, $secret, $exp = 3600) {
    $header = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload['exp'] = time() + $exp;
    $payload = base64_encode(json_encode($payload));
    $signature = hash_hmac('sha256', "$header.$payload", $secret, true);
    $signature = base64_encode($signature);
    return "$header.$payload.$signature";
}
function verify_jwt($jwt, $secret) {
    $parts = explode('.', $jwt);
    if (count($parts) !== 3) return false;
    list($header, $payload, $signature) = $parts;
    $valid = base64_encode(hash_hmac('sha256', "$header.$payload", $secret, true));
    if (!hash_equals($valid, $signature)) return false;
    $payloadArr = json_decode(base64_decode($payload), true);
    if (!$payloadArr || !isset($payloadArr['exp']) || $payloadArr['exp'] < time()) return false;
    return $payloadArr;
}

$secret = 'nadu-admin-secret-key';
$action = $_GET['action'] ?? '';

if ($action === 'login') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    $stmt = $pdo->prepare('SELECT * FROM admin_users WHERE username = ?');
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($user && password_verify($password, $user['password_hash'])) {
        $token = generate_jwt(['id' => $user['id'], 'username' => $user['username']], $secret);
        echo json_encode(['success' => true, 'token' => $token, 'user' => ['id' => $user['id'], 'username' => $user['username']]]);
    } else {
        echo json_encode(['success' => false, 'message' => '帳號或密碼錯誤']);
    }
    exit;
}

if ($action === 'verify') {
    $token = $_POST['token'] ?? ($_SERVER['HTTP_AUTHORIZATION'] ?? '');
    if (strpos($token, 'Bearer ') === 0) $token = substr($token, 7);
    $payload = verify_jwt($token, $secret);
    if ($payload) {
        echo json_encode(['success' => true, 'user' => $payload]);
    } else {
        echo json_encode(['success' => false, 'message' => '驗證失敗']);
    }
    exit;
}

if ($action === 'reset_password') {
    $username = $_POST['username'] ?? '';
    $newPassword = $_POST['new_password'] ?? '';
    if (!$username || !$newPassword) {
        echo json_encode(['success' => false, 'message' => '缺少參數']);
        exit;
    }
    $hash = password_hash($newPassword, PASSWORD_BCRYPT);
    $stmt = $pdo->prepare('UPDATE admin_users SET password_hash = ? WHERE username = ?');
    $stmt->execute([$hash, $username]);
    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => '重設失敗']);
    }
    exit;
}

echo json_encode(['success' => false, 'message' => '未知 action']); 