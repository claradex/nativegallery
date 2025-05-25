<?php
include($_SERVER['DOCUMENT_ROOT'] . "/classes/DB.php");
include($_SERVER['DOCUMENT_ROOT'] . "/classes/Auth.php");
if (!isLoggedIn()) {
    header('Location: /');
}

function getFullUrl() {
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https://" : "http://";
    return $protocol . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
}

$fullUrl = getFullUrl();
$parsedUrl = parse_url($fullUrl);
$baseUrl = $parsedUrl['scheme'] . '://' . $parsedUrl['host'];
$pathAndQuery = str_replace($baseUrl, '', $fullUrl);

function saveTasks() {
    $filteredIds = [];
    foreach ($_POST as $key => $value) {
        if (strpos($key, 'rsn__') === 0) {
            $id = substr($key, 5);
            $filteredIds[] = $id;
        }
    }
    
    if (!empty($filteredIds)) {
        foreach ($filteredIds as $id) {
            $val = ((int)$_POST['rsn__' . $id] === 0) ? 1 : 2;
            DB::query('UPDATE tasks SET checked=:c WHERE id=:id', [':id' => $id, ':c' => $val]);
        }
    }
}

if (isset($_POST['approve'])) {
    saveTasks();
    DB::query('UPDATE applications_details SET checked=:ch WHERE category_id=:id AND user_id=:uid', 
        [':ch' => 1, ':id' => $_GET['id'], ':uid' => $_GET['uid']]);
} elseif (isset($_POST['decline'])) {
    saveTasks();
    DB::query('UPDATE applications_details SET checked=:ch WHERE category_id=:id AND user_id=:uid', 
        [':ch' => 2, ':id' => $_GET['id'], ':uid' => $_GET['uid']]);
}

$categoryTitle = htmlspecialchars(DB::query('SELECT title FROM categories_sub WHERE id=:id', [':id' => $_GET['id']])[0]['title']);
$isAdmin = (int)($_GET['adm'] ?? 0) === 1;
$userId = $isAdmin ? $_GET['uid'] : isLoggedIn();
$subs = DB::query('SELECT * FROM tasks WHERE category_id=:id AND user_id=:uid', [':id' => $_GET['id'], ':uid' => $userId]);

$appDetails = DB::query('SELECT * FROM applications_details WHERE user_id = :uid AND category_id = :cid', 
    [':uid' => $userId, ':cid' => $_GET['id']]);
$formData = $appDetails[0] ?? [
    'experience' => '',
    'work_days' => '[]',
    'work_time_from' => '',
    'work_time_to' => '',
    'description' => '',
    'myself' => 0
];
$workDays = json_decode($formData['work_days'], true);
?>
<!DOCTYPE html>
<html lang="en">
<head>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js">
</head>
<body>
    <?php include($_SERVER['DOCUMENT_ROOT'] . '/classes/Navbar.php'); ?>

    <div class="container mt-5">
        <div class="row mt-3">
            <div class="col-md-3">
                <?php if (!$isAdmin) : ?>
                    <?php include($_SERVER['DOCUMENT_ROOT'] . '/classes/MySidebar.php'); ?>
                <?php endif; ?>
            </div>

            <div class="col-md-9">
                <form<?= $isAdmin ? ' action="' . htmlspecialchars($pathAndQuery) . '" method="post"' : ' id="subFormd"' ?>>
                    <div id="tsksa">
                        <div class="list-group services-list">
                            <h1><?= $categoryTitle ?></h1>

                            <?php foreach ($subs as $s) : 
                                $statusIcon = match((int)$s['checked']) {
                                    0 => '/static/svg/clock.svg',
                                    1 => '/static/svg/success-ic.svg',
                                    2 => '/static/svg/warning-ic.svg',
                                };
                                $sdata = DB::query('SELECT * FROM tasks WHERE id=:id', [':id' => $s['id']])[0];
                                $imgsd = json_decode($sdata['images']);
                            ?>
                                <!-- Task Item -->
                                <div class="list-group-item d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5><b><?= htmlspecialchars($s['title']) ?> (€<?= htmlspecialchars($s['cost']) ?>)</b></h5>
                                        <p><?= htmlspecialchars($s['description']) ?></p>
                                        <div class="mb-3">
                                            <?php if (!$isAdmin) : ?>
                                                <a href="#" data-bs-toggle="modal" data-bs-target="#delete<?= $s['id'] ?>Modal" class="text-danger me-3">Supprimer</a>
                                                <a href="#" data-bs-toggle="modal" data-bs-target="#edit<?= $s['id'] ?>Modal">Editer</a>
                                            <?php else : ?>
                                                <select required name="rsn__<?= $s['id'] ?>">
                                                    <option value="">Select</option>
                                                    <option value="0">Accept</option>
                                                    <option value="1">Decline</option>
                                                </select>
                                            <?php endif; ?>
                                        </div>
                                    </div>
                                    <img width="20" src="<?= $statusIcon ?>">
                                </div>

                                <!-- Delete Modal -->
                                <div class="modal fade" id="delete<?= $s['id'] ?>Modal" tabindex="-1">
                                    <div class="modal-dialog">
                                        <div class="modal-content">
                                            <div class="modal-header">
                                                <h5 class="modal-title">Confirmation</h5>
                                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                                            </div>
                                            <div class="modal-body">
                                                Êtes-vous sûr de vouloir supprimer?
                                            </div>
                                            <div class="modal-footer">
                                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Non</button>
                                                <a href="/api/deletetask.php?id=<?= $s['id'] ?>" class="btn btn-danger">Oui</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                              <!-- Модальное окно редактирования задачи -->
<?php foreach ($subs as $s) : 
    $sdata = DB::query('SELECT * FROM tasks WHERE id=:id', [':id' => $s['id']])[0];
    $imgsd = json_decode($sdata['images']);
?>
<div class="modal fade" id="edit<?= $s['id'] ?>Modal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Modifier le service</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form id="subFormED<?= $s['id'] ?>">
                <div class="modal-body">
                    <input type="hidden" name="taskid" value="<?= $s['id'] ?>">
                    
                    <div class="mb-3">
                        <label class="form-label">Titre</label>
                        <input type="text" class="form-control" name="serviceName" 
                               value="<?= htmlspecialchars($sdata['title']) ?>">
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Coût</label>
                        <div class="input-group">
                            <input type="number" class="form-control" name="serviceCost" 
                                   value="<?= htmlspecialchars($sdata['cost']) ?>">
                            <span class="input-group-text">€</span>
                            <select name="serviceCostUnit" class="form-select">
                                <option value="за услугу" <?= $sdata['unit'] === 'за услугу' ? 'selected' : '' ?>>Par service</option>
                                <option value="за час" <?= $sdata['unit'] === 'за час' ? 'selected' : '' ?>>Par heure</option>
                            </select>
                        </div>
                        <div class="form-check mt-2">
                            <input class="form-check-input" type="checkbox" 
                                   id="negotiable<?= $s['id'] ?>" <?= $sdata['negotiable'] ? 'checked' : '' ?>>
                            <label class="form-check-label" for="negotiable<?= $s['id'] ?>">
                                Négociable
                            </label>
                        </div>
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Description</label>
                        <textarea class="form-control" name="serviceDescription" rows="3"
                                  ><?= htmlspecialchars($sdata['description']) ?></textarea>
                    </div>

                    <div class="mb-3">
                        <label class="form-label">Photos</label>
                        <div class="row row-cols-4">
                            <?php for ($i = 0; $i < 4; $i++) : ?>
                            <div class="col">
                                <label class="upload-btn" 
                                    style="<?= !empty($imgsd[$i]) ? "background-image: url('{$imgsd[$i]}')" : '' ?>">
                                    <input type="file" class="upload-input" 
                                           name="serviceImages[]" 
                                           onchange="previewImage(event, this)">
                                    <i class="bi bi-plus-lg"></i>
                                </label>
                            </div>
                            <?php endfor; ?>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                    <button type="submit" class="btn btn-primary">Sauvegarder</button>
                </div>
            </form>
        </div>
    </div>
</div>

                              <script>
// JavaScript обработчик для формы редактирования
document.getElementById('subFormED<?= $s['id'] ?>').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    
    fetch('/api/edittask.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if(data.success) {
            bootstrap.Modal.getInstance(document.getElementById('edit<?= $s['id'] ?>Modal')).hide();
            window.location.reload();
        }
    })
    .catch(error => console.error('Error:', error));
});
</script>
<?php endforeach; ?>
                        </div>
                    </div>
                </form>

                <!-- Вторая форма (About Specialization) -->
                <form id="subFormdd" method="post">
                    <h4 class="mt-5">A propos de la spécialisation</h4>
                    
                    <?php if ($appDetails && $appDetails[0]['checked'] === 0 && !$isAdmin) : ?>
                        <div class="alert alert-warning">
                            Ваши данные на модерации
                        </div>
                    <?php endif; ?>

                    <div class="mb-3">
                        <label class="form-label">Expérience</label>
                        <select class="form-select" name="experience">
                            <?php for ($i = 0; $i <= 11; $i++) : ?>
                                <option value="<?= $i ?>" <?= $i == $formData['experience'] ? 'selected' : '' ?>>
                                    <?= $i === 11 ? '10+ années' : ($i === 0 ? '—' : "$i année") ?>
                                </option>
                            <?php endfor; ?>
                        </select>
                    </div>

                    <!-- Полное содержимое второй формы -->
                    
                    <?php if ($isAdmin) : ?>
                        <div class="mb-3">
                            <button type="submit" name="approve" class="btn btn-primary">Approve</button>
                            <button type="submit" name="decline" class="btn btn-danger">Decline</button>
                        </div>
                    <?php else : ?>
                        <button type="submit" class="btn btn-primary">Économiser</button>
                    <?php endif; ?>
                </form>
            </div>
        </div>

        <!-- New Service Modal -->
        <div class="modal fade" id="newServiceModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <!-- Полное содержимое модального окна нового сервиса -->
                </div>
            </div>
        </div>
    </div>

    <!-- Все скрипты из оригинала -->
    <script>
    $(document).ready(function() {
        $('#multiple-select-field').select2({
            theme: "bootstrap-5",
            closeOnSelect: false
        });
    });
    </script>
</body>
</html>