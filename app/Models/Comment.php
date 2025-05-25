<?php

namespace App\Models;

use \App\Services\{DB, Date, Auth, Emoji, Word};
use \App\Models\{User, Photo, Vote};

class Comment
{

    public $commentid;
    public $c;
    public $class;
    function __construct($user_id)
    {
        $this->c = $user_id;
    }
    public function class($class)
    {
        $this->class = $class;
    }
    public function content($table)
    {
        $content = json_decode($this->c['content'], true);
        return $content[$table];
    }




    private function processContent($rawText)
    {
        // 1. Обработка упоминаний и смайлов
        $withTags = Emoji::parseSmileys(Word::processMentions($rawText));

        // 2. Селективное экранирование
        $safeContent = $this->selectiveHtmlEscape($withTags);

        // 3. Обрезка контента
        return $this->truncateContent($safeContent, 200);
    }

    private function selectiveHtmlEscape(string $html): string
    {
        // 0. Если текст не UTF‑8, конвертируем из CP1251
        if (!mb_check_encoding($html, 'UTF-8')) {
            $html = mb_convert_encoding($html, 'UTF-8', 'CP1251');
        }

        // 1. Разбиваем на «теги» и «текст», сохраняя теги
        $parts = preg_split('/(<[^>]+>)/u', $html, -1, PREG_SPLIT_DELIM_CAPTURE);

        foreach ($parts as &$part) {
            // 2. Тег — пропускаем
            if (preg_match('/^<[^>]+>$/u', $part)) {
                continue;
            }
            // 3. Текст — сначала декодируем все сущности, потом экранируем спецсимволы
            //    ENT_QUOTES|ENT_HTML5 и false у double_encode гарантируют корректную работу с &nbsp; etc.
            $decoded = html_entity_decode($part, ENT_QUOTES | ENT_HTML5, 'UTF-8');
            $part    = htmlspecialchars($decoded, ENT_QUOTES | ENT_HTML5, 'UTF-8', false);
        }
        unset($part);

        // 4. Собираем обратно
        return implode('', $parts);
    }








    private function truncateContent(string $html, int $maxLength): string
    {
        $dom = new \DOMDocument('1.0', 'UTF-8');
        libxml_use_internal_errors(true);

        $wrapped = '<?xml encoding="UTF-8"><div>' . $html . '</div>';

        $dom->loadHTML($wrapped, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        libxml_clear_errors();

        $xpath = new \DOMXPath($dom);
        $node  = $xpath->query('//div')->item(0);
        $this->truncateNode($node, $maxLength);


        return $dom->saveHTML($node);
    }



    private function truncateNode(\DOMNode $node, &$remaining)
    {
        if ($remaining <= 0) return;

        foreach ($node->childNodes as $child) {
            if ($child instanceof \DOMText) {
                $text = $child->nodeValue;
                $visible = mb_substr($text, 0, $remaining);
                $hidden = mb_substr($text, $remaining);

                if ($remaining < mb_strlen($text)) {
                    $child->nodeValue = $visible;
                    $remaining = 0;

                    // Создаём элемент для скрытой части
                    $hiddenNode = $child->ownerDocument->createElement('span');
                    $hiddenNode->setAttribute('class', 'hidden-text');
                    $hiddenTextNode = $child->ownerDocument->createTextNode($hidden);
                    $hiddenNode->appendChild($hiddenTextNode);

                    // Вставляем hiddenNode после текущего текстового узла
                    $parent = $child->parentNode;
                    if ($parent) {
                        if ($child->nextSibling) {
                            $parent->insertBefore($hiddenNode, $child->nextSibling);
                        } else {
                            $parent->appendChild($hiddenNode);
                        }
                    }

                    // Создаём кнопку "показать больше"
                    $button = $child->ownerDocument->createElement('a');
                    $buttonText = $child->ownerDocument->createTextNode('показать больше');
                    $button->appendChild($buttonText);
                    $button->setAttribute('class', 'toggle-message');
                    if ($parent) {
                        $parent->appendChild($button);
                    }

                    break;
                }

                $remaining -= mb_strlen($text);
            } else {
                $this->truncateNode($child, $remaining);
            }
        }
    }
    public function i()
    {
        $user = new User($this->c['user_id']);
        $content = json_decode($this->c['content'], true);
        $photo = new \App\Models\Photo($this->c['photo_id']);

        $pinc = 'Закрепить';
        echo '<div class="' . $this->class . ' comment" wid="' . $this->c['id'] . '">';
        if ($photo->i('pinnedcomment_id') === $this->c['id']) {
            echo '<i style="padding-bottom: 15px;">Комментарий закреплён</i>';
            $pinc = 'Открепить';
        }
        echo '
                                <div style="float:right; text-align:right" class="sm">
                                    <span class="message_date">' . Date::zmdate($this->c['posted_at']) . '</span><br>
                                     <a href="#' . $this->c['id'] . '" class="cmLink dot">Ссылка</a>
                                     ';

        echo '
                                </div>
                                <a name="2681468"></a><a name="last"></a>
                                <div><img src="' . $user->i('photourl') . '" width="32" style="border-radius: 3px; margin-right: 5px;"><b><a href="/author/' . $this->c['user_id'] . '/" class="message_author">' . htmlspecialchars($user->i('username')) . '</a></b> &middot; 
                                <span class="flag">';
        if (json_decode($user->i('content'), true)['aboutrid']['value'] != null) {
            echo '<img src="/static/img/flags/' . json_decode($user->i('content'), true)['aboutrid']['value'] . '.gif">';
        }
        if (json_decode($user->i('content'), true)['aboutlive']['value'] != null) {
            echo ' ' . htmlspecialchars(json_decode($user->i('content'), true)['aboutlive']['value']);
        }
        if ($content['edited'] === 'true') {
            echo '<br>(отредактировано)';
        }
        if ($user->i('admin') === 1) {
            $admintype = ' · Администратор сервера';
        } else if ($user->i('admin') === 2) {
            $admintype = ' · Фотомодератор';
        }
        if ((int)Vote::countcommrates($this->c['id'], -1) >= 1) {
            $commclass = 'pro';
            $symb = '+';
        } else if ((int)Vote::countcommrates($this->c['id'], -1) < 0) {
            $commclass = 'con';
            $symb = '';
        } else if ((int)Vote::countcommrates($this->c['id'], -1) === 0) {
            $commclass = '';
        }
        echo '</span></div>
                                <div class="rank">Фото: ' . Photo::fetchAll($this->c['user_id']) . ' ' . $admintype . '</div>'; ?>
        <div class="message-text">
            <?php
            // Правильный порядок:
            $processedText = $this->processContent($this->c['body']);

            // Шаг 4: Вывод без дополнительного экранирования
            echo '<div class="message-text">' . $processedText . '</div>';

            // ========== Вспомогательные методы ==========


            ?>
        </div> <?php

                if ($content['filetype'] === 'img') {
                    echo '<div class="message-text"><img src="' . $content['src'] . '" width="250"></div>';
                }
                if ($content['filetype'] === 'video') {
                    echo '<div class="message-text"><video controls src="' . $content['src'] . '" width="250"></div>';
                }
                echo '
                                <div class="comment-votes-block">
                               ';
                echo '<style>
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-content {
  display: none;
  position: absolute;
  background-color: #f9f9f9;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  padding: 12px 16px;
  z-index: 1;
}

.dropdown:hover .dropdown-content {
  display: block;
}
</style>';
                if ($this->c['user_id'] === Auth::userid() || $photo->i('user_id') === Auth::userid()) {
                    echo '
                                <div class="dropdown">
                                <a style="color: #000" class="compl" href="#">...</a>
                                 <div class="dropdown-content">';


                ?>

            <a href="#" onclick="pinComment(<?= $this->c['id'] ?>); return false;"><?= $pinc ?></a><br>
            <?php
                    if ($this->c['user_id'] === Auth::userid()) { ?>
                <a style="margin-bottom: 10px;" href="#" onclick="createModal(<?= $this->c['id'] ?>, 'EDIT_COMMENT', '<?= htmlspecialchars($this->c['body']) ?>', 'modaledit<?= $this->c['id'] ?>'); return false;">Редактировать</a><br>
                <a href="#" onclick="createModal(<?= $this->c['id'] ?>, 'DELETE_COMMENT', '', 'modaldel<?= $this->c['id'] ?>'); return false;">Удалить</a>
<?php }

                    echo '
  </div>
  </div>
                                ';
                }
                echo '
                                    <div class="wvote" wid="' . $this->c['id'] . '">
                                    <a href="#" vote="1" class="w-btn s2"><span>+</span></a>
                                    
                                        <div class="w-rating ' . $commclass . ' active">' . $symb . Vote::countcommrates($this->c['id'], -1) . '</div>
                                        
                                        <div class="w-rating-ext">
                                            <div><span class="pro">+' . Vote::countcommrates($this->c['id'], 1) . '</span> / <span class="con">' . Vote::countcommrates($this->c['id'], 0) . '</span></div>
                                        </div>
                                        <a href="#" vote="0" class="w-btn s5"><span>–</span></a>
                                    </div>
                                </div>
                            </div>';
            }
        }
