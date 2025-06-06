<?php
require_once 'cors.php';
require_once 'db.php';
header('Content-Type: application/json');

try {
    // 總銷售額
    $totalRevenue = $pdo->query('SELECT IFNULL(SUM(total_amount + shipping_fee),0) FROM orders')->fetchColumn();
    // 訂單數
    $orders = $pdo->query('SELECT COUNT(*) FROM orders')->fetchColumn();
    // 會員數
    $users = $pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();
    // 商品數
    $products = $pdo->query('SELECT COUNT(*) FROM products')->fetchColumn();
    // 平均訂單金額
    $avgOrder = $orders > 0 ? round($totalRevenue / $orders, 2) : 0;

    // 每日銷售趨勢（近 30 天）
    $daily = $pdo->query("SELECT DATE(created_at) as date, COUNT(*) as orders, SUM(total_amount + shipping_fee) as revenue, ROUND(AVG(total_amount + shipping_fee),2) as avgOrderValue FROM orders WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) GROUP BY DATE(created_at) ORDER BY date ASC")->fetchAll(PDO::FETCH_ASSOC);
    // 每月銷售趨勢（近 12 個月）
    $monthly = $pdo->query("SELECT DATE_FORMAT(created_at, '%Y-%m') as date, COUNT(*) as orders, SUM(total_amount + shipping_fee) as revenue, ROUND(AVG(total_amount + shipping_fee),2) as avgOrderValue FROM orders WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH) GROUP BY DATE_FORMAT(created_at, '%Y-%m') ORDER BY date ASC")->fetchAll(PDO::FETCH_ASSOC);

    // 熱門商品（依訂單數排序前 5）
    $topProducts = $pdo->query("SELECT oi.product_id, oi.product_name as name, COUNT(oi.order_id) as order_count, SUM(oi.quantity) as sales, SUM(oi.subtotal) as revenue FROM order_items oi GROUP BY oi.product_id, oi.product_name ORDER BY order_count DESC, sales DESC LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);
    $totalProductRevenue = array_sum(array_column($topProducts, 'revenue'));
    foreach ($topProducts as &$p) {
        $p['percentageOfTotal'] = $totalProductRevenue > 0 ? round($p['revenue'] / $totalRevenue * 100, 2) : 0;
    }

    // 最佳客戶（消費金額前 5）
    $topCustomers = $pdo->query("SELECT u.name, COUNT(o.id) as orders, SUM(o.total_amount + o.shipping_fee) as spent FROM orders o JOIN users u ON o.user_id = u.id GROUP BY o.user_id ORDER BY spent DESC LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);

    // 新舊客戶比例
    $newCustomers = $pdo->query("SELECT COUNT(*) FROM (SELECT user_id FROM orders WHERE user_id IS NOT NULL AND user_id != 0 GROUP BY user_id HAVING COUNT(id) = 1) t")->fetchColumn();
    $returningCustomers = $pdo->query("SELECT COUNT(*) FROM (SELECT user_id FROM orders WHERE user_id IS NOT NULL AND user_id != 0 GROUP BY user_id HAVING COUNT(id) > 1) t")->fetchColumn();

    // 最近 5 筆訂單
    $recentOrders = $pdo->query("SELECT o.id, o.order_number, u.name as user_name, o.total_amount, o.shipping_fee, o.status, o.created_at FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => [
            'products' => $products,
            'orders' => $orders,
            'users' => $users,
            'totalRevenue' => $totalRevenue,
            'avgOrder' => $avgOrder,
            'daily' => $daily,
            'monthly' => $monthly,
            'topProducts' => $topProducts,
            'topCustomers' => $topCustomers,
            'recentOrders' => $recentOrders,
            'newVsReturning' => [
                'new' => (int)$newCustomers,
                'returning' => (int)$returningCustomers
            ]
        ],
        'message' => ''
    ]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'data' => null, 'message' => $e->getMessage()]);
} 