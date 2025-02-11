<?php

use \App\Services\{KeyTranslation};
use \App\Models\User;

use Symfony\Component\Yaml\Yaml;

$yamlFile = $_SERVER['DOCUMENT_ROOT'].'/ngallery.yaml';
function renderInputs($data, $prefix = '') {
    foreach ($data as $key => $value) {
        $name = $prefix ? "{$prefix}[{$key}]" : $key;
        $key = KeyTranslation::key($key);

        if (is_string($value) || is_bool($value)) {

            if ($value === true || $value === false) {
                $value = $value ? 'true' : 'false';
            }

            if ($value === 'true' || $value === 'false') {
                echo "<div class='mb-2'>
                        <label>{$key}</label>
                        <select class='form-control' name='{$name}'>
                            <option value='true' " . ($value === 'true' ? 'selected' : '') . ">true</option>
                            <option value='false' " . ($value === 'false' ? 'selected' : '') . ">false</option>
                        </select>
                      </div>";
            } else {
                echo "<div class='mb-2'>
                        <label>{$key}</label>
                        <input class='form-control' type='text' name='{$name}' value='" . htmlspecialchars($value, ENT_QUOTES) . "'>
                      </div>";
            }
        } elseif (is_numeric($value)) {
            echo "<div class='mb-2'>
                    <label>{$key}</label>
                    <input class='form-control' type='number' name='{$name}' value='{$value}'>
                  </div>";
        } elseif (is_array($value)) {
            echo "<fieldset class='mb-3 p-2 border'><legend>{$key}</legend>";
            renderInputs($value, $name);
            echo "</fieldset>";
        }
    }
}


?>
<!DOCTYPE html>
<html lang="ru">
<script src="https://code.jquery.com/jquery-3.7.1.js"></script>
<link rel="stylesheet" href="/static/css/notie.css<?php if (NGALLERY['root']['cloudflare-caching'] === true) {
                                                        echo '?' . time();
                                                    } ?>">
<script src="/static/js/notie.js<?php if (NGALLERY['root']['cloudflare-caching'] === true) {
                                    echo '?' . time();
                                } ?>"></script>

<script>
    notie.setOptions({
        transitionCurve: 'cubic-bezier(0.2, 0, 0.2, 1)'
    });
    var Notify = {
        noty: function(status, text) {

            if (status == 'danger') status = 'error';

            return notie.alert({
                type: status,
                text: text
            })

        },
    }
</script>

<body>
    <div class="container">

        <?= \App\Controllers\AdminController::loadMenu(); ?>
        <?= \App\Controllers\AdminController::loadContent(); ?>
        
        <h1><b>Настройки</b></h1>
        <div class="alert alert-warning" role="alert">
  Изменяйте только на свой страх и риск.
</div>
        <div class="p20w" style="display:block">
           <?php
           // Вывод формы
           echo '<form method="post">';
            foreach (NGALLERY as $ng) {
                renderInputs($ng);
            }
           echo '<button type="submit">Сохранить</button>';
           echo '</form>';
?>
        </div><br>
     


    </div>



</body>

</html>