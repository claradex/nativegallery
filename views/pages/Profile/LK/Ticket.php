<?php

use App\Services\{Auth, DB, Date};
use App\Models\Vehicle;

$requests = DB::query(
    'SELECT * FROM entities_requests WHERE user_id = :uid ORDER BY id DESC',
    [':uid' => Auth::userid()]
);

$lkActive = 'ticket';

$statusLabels = [
    0 => ['label' => 'В рассмотрении', 'class' => 's1'],
    1 => ['label' => 'Принято', 'class' => 's2'],
    2 => ['label' => 'Отклонено', 'class' => 's5'],
];

?>
<!DOCTYPE html>
<html lang="ru">

<head>
    <?php include $_SERVER['DOCUMENT_ROOT'] . '/views/components/LoadHead.php'; ?>
</head>

<body>
    <div id="backgr"></div>
    <table class="tmain">
        <?php include $_SERVER['DOCUMENT_ROOT'] . '/views/components/Navbar.php'; ?>
        <tr>
            <td class="main">
                <?php include $_SERVER['DOCUMENT_ROOT'] . '/views/components/LkShellOpen.php'; ?>
                <h1>Мои заявки</h1>
                <p class="sm">Заявки на добавление и уточнение записей в базе данных транспортных средств.</p>
                <p><a href="/vehicle/edit" class="und">Отправить новую заявку</a></p>

                <div class="sm" style="margin: 12px 0 16px">
                    <span class="p20 s1" style="display:inline-block; padding:1px 5px 2px; margin-right:10px">В рассмотрении</span>
                    <span class="p20 s2" style="display:inline-block; padding:1px 5px 2px; margin-right:10px">Принято</span>
                    <span class="p20 s5" style="display:inline-block; padding:1px 5px 2px; margin-right:10px">Отклонено</span>
                </div>

                <?php if ($requests === []) { ?>
                    <div class="p20" style="padding:10px 12px">У вас пока нет заявок.</div>
                <?php } else { ?>
                    <div class="p20w" style="display:block">
                        <table>
                            <tbody>
                                <tr>
                                    <th width="60">№</th>
                                    <th width="18%">Дата</th>
                                    <th width="22%">Название</th>
                                    <th width="18%">Тип записи</th>
                                    <th>Данные</th>
                                    <th width="90">Фото</th>
                                    <th width="120">Статус</th>
                                </tr>
                                <?php foreach ($requests as $request) {
                                    $status = (int) ($request['status'] ?? 0);
                                    $statusMeta = $statusLabels[$status] ?? ['label' => 'Неизвестно', 'class' => 's0'];
                                    $entity = new Vehicle((int) $request['entityid']);
                                    $entityTitle = htmlspecialchars((string) $entity->i('title'));

                                    $fieldsHtml = '';
                                    $sample = json_decode((string) $entity->i('sampledata'), true);
                                    $values = json_decode((string) $request['data'], true);
                                    if (is_array($sample) && is_array($values)) {
                                        $num = 1;
                                        foreach ($sample as $field) {
                                            $value = trim((string) ($values[$num]['value'] ?? ''));
                                            if ($value !== '') {
                                                $fieldsHtml .= '<b>' . htmlspecialchars((string) ($field['name'] ?? '')) . ':</b> '
                                                    . htmlspecialchars($value) . '<br>';
                                            }
                                            $num++;
                                        }
                                    }
                                    if ($fieldsHtml === '') {
                                        $fieldsHtml = '—';
                                    }

                                    $photoHtml = '—';
                                    $photoId = (int) ($request['photo_id'] ?? 0);
                                    if ($photoId > 0) {
                                        $photoRows = DB::query(
                                            'SELECT id, photourl FROM photos WHERE id = :id',
                                            [':id' => $photoId]
                                        );
                                        if ($photoRows) {
                                            $photoHtml = '<a href="/photo/' . $photoId . '/" target="_blank">'
                                                . '<img src="'
                                                . htmlspecialchars(ng_photo_thumb($photoRows[0]['photourl']))
                                                . '" style="max-width:72px" alt=""></a>';
                                        } else {
                                            $photoHtml = '#' . $photoId;
                                        }
                                    }
                                    ?>
                                    <tr class="<?= $statusMeta['class'] ?>">
                                        <td class="n"><?= (int) $request['id'] ?></td>
                                        <td class="ds"><?= Date::zmdate((int) $request['created_at']) ?></td>
                                        <td class="d"><b><?= htmlspecialchars((string) $request['title']) ?></b></td>
                                        <td class="ds"><?= $entityTitle ?></td>
                                        <td class="sm"><?= $fieldsHtml ?></td>
                                        <td class="c"><?= $photoHtml ?></td>
                                        <td class="ds"><b><?= $statusMeta['label'] ?></b></td>
                                    </tr>
                                <?php } ?>
                            </tbody>
                        </table>
                    </div>
                <?php } ?>
                <?php include $_SERVER['DOCUMENT_ROOT'] . '/views/components/LkShellClose.php'; ?>
            </td>
        </tr>
        <tr>
            <?php include $_SERVER['DOCUMENT_ROOT'] . '/views/components/Footer.php'; ?>
        </tr>
    </table>
</body>

</html>