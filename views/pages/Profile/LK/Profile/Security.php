<?php
use \App\Services\{DB, Auth, Date};
$sessions = DB::query('SELECT * FROM login_tokens WHERE user_id=:uid', array(':uid'=>Auth::userid()));
foreach ($sessions as $session) {
    try {
        $iv = $session['iv'];
        $decryptedIp = openssl_decrypt($session['ip'], 'AES-256-CBC', NGALLERY['root']['encryptionkey'], 0, $iv);
        $decryptedLoc = openssl_decrypt($session['location'], 'AES-256-CBC', NGALLERY['root']['encryptionkey'], 0, $iv);
    } catch (Exception $e) {
        $decryptedIp = 'Ошибка дешифровки';
        $decryptedLoc = 'Ошибка дешифровки';
    }

     $is_current = ($session['token'] === $current_token);
    
  echo '<div class="session-card'.($is_current ? ' current' : '').'">';
    echo '<div class="card-header">';
        echo '<div class="device-info">';
            echo '<svg class="device-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M17 1H7c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 18H7V5h10v14z"/></svg>';
            echo '<div class="device-meta">';
                echo '<h3>'.htmlspecialchars($session['device_name']).'</h3>';
                echo '<p class="os-version">'.htmlspecialchars($session['os']).'</p>';
            echo '</div>';
        echo '</div>';
        echo '<div class="session-status">'.($is_current ? 'Текущая сессия' : '').'</div>';
    echo '</div>';

    echo '<div class="card-details">';
        echo '<div class="detail-item">';
            echo '<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>';
            echo htmlspecialchars($decryptedLoc);
        echo '</div>';

        echo '<div class="detail-item">';
            echo '<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/></svg>';
            echo htmlspecialchars($decryptedIp);
        echo '</div>';

        echo '<div class="detail-item">';
            echo '<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>';
            echo Date::zmdate($session['last_activity']);
        echo '</div>';
    echo '</div>';

    if (!$is_current) {
        echo '<form method="POST" class="session-form">';
            echo '<input type="hidden" name="token" value="'.$session['token'].'">';
            echo '<button type="submit" name="delete" class="delete-btn">';
                echo '<svg class="trash-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>';
                echo 'Завершить сессию';
            echo '</button>';
        echo '</form>';
    }
echo '</div>';
}
?>
<style>
/* Базовые стили */
.session-card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 3px 6px rgba(0,0,0,0.05);
    padding: 18px;
    margin: 15px 0;
    transition: all 0.3s ease;
    border: 1px solid #eee;
    position: relative;
}

.session-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0,0,0,0.1);
}

/* Иконки */
.device-icon, .icon {
    width: 20px;
    height: 20px;
    margin-right: 10px;
    vertical-align: middle;
    fill: #5f6368;
}

.trash-icon {
    width: 18px;
    height: 18px;
    margin-right: 8px;
    fill: #fff;
}

/* Заголовок карточки */
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.device-info {
    display: flex;
    align-items: center;
}

.device-meta h3 {
    margin: 0;
    font-size: 17px;
    color: #202124;
}

.os-version {
    margin: 3px 0 0;
    font-size: 14px;
    color: #80868b;
}

/* Детали сессии */
.card-details {
    display: grid;
    gap: 12px;
    margin-bottom: 15px;
}

.detail-item {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #5f6368;
}

/* Кнопка удаления */
.delete-btn {
    background: #dc3545;
    color: white;
    border: none;
    padding: 8px 15px;
    border-radius: 6px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    transition: background 0.2s;
}

.delete-btn:hover {
    background: #bb2d3b;
}

/* Статус сессии */
.session-status {
    font-size: 13px;
    color: #34a853;
    background: #e8f6ef;
    padding: 4px 10px;
    border-radius: 15px;
}

/* Текущая сессия */
.session-card.current {
    border-left: 4px solid #4285f4;
    background: #f8f9fe;
}
</style>