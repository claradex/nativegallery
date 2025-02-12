<?php

use \App\Services\{Auth, DB, Date};
use \App\Models\{User, Photo, Vote};


?>
<!DOCTYPE html>
<html lang="ru">

<head>
    <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/LoadHead.php'); ?>


</head>


<body>
    <div id="backgr"></div>
    <table class="tmain">
        <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/Navbar.php'); ?>
        <tr>
            <td class="main">
                <h1>Лента комментариев</h1>
                <script src="/js/jquery-ui.js?1633005526"></script>
                <script src="/js/selector.js?1730197663"></script>
                <script>
                    $(document).ready(function() {
                        $('#cname').citySelector('cid', {
                            defaultLabel: 'Все города'
                        });
                        $('#type').val(0).change(function() {
                            $(this).attr('class', $('option:selected', this).attr('class'));
                        }).change();

                        $('#applyFilter').on('click', function() {
                            var cid = $('#cid').val();
                            var type = $('#type').val();
                            var redir = '/comments.php';

                            if (cid > 0 || type > 0) {
                                redir = redir + '?';
                                if (cid > 0) {
                                    redir = redir + 'cid=' + cid;
                                    if (type > 0) redir = redir + '&';
                                }
                                if (type > 0) redir = redir + 't=' + type;
                            }

                            window.location.href = redir;
                        });
                    });
                </script>
                <div id="upd_anchor"></div>
                <?php
                $comments = DB::query('SELECT * FROM photos_comments ORDER BY id DESC LIMIT 30');
                foreach ($comments as $c) {
                    $user = new User($c['user_id']);
                    $content = json_decode($c['content'], true);
                    $photo = new Photo($c['photo_id']);
                    if ($user->i('admin') === 1) {
                        $admintype = ' · Администратор сервера';
                    } else if ($user->i('admin') === 2) {
                        $admintype = ' · Фотомодератор';
                    }
                    if ((int)Vote::countcommrates($c['id'], -1) >= 1) {
                        $commclass = 'pro';
                        $symb = '+';
                    } else if ((int)Vote::countcommrates($c['id'], -1) < 0) {
                        $commclass = 'con';
                        $symb = '';
                    } else if ((int)Vote::countcommrates($c['id'], -1) === 0) {
                        $commclass = '';
                    }
                    echo '<div class="p-comment p20p">
                    <div class="pc-photo"><a href="/photo/'.$c['photo_id'].'/?top=1" target="_blank" class="prw"><img src="/api/photo/compress?url='.$photo->i('photourl').'" class="f"></a></div>
                    <div class="pc-content">
                        <a class="pc-topost" href="/photo/'.$c['photo_id'].'/?top=1#' . $c['id'] . '" target="_blank">Ссылка</a>
                        <div class="pc-text">
                            <div><span class="cmt-aname">
                                    <b><a href="/author/'.$c['user_id'].'/">'.$user->i('username').'</a></b></span> &middot; <span class="sm nw">'.Date::zmdate($c['posted_at']).'</span>
                                <div class="rank">Фото: '.Photo::fetchAll($c['user_id']).''.$admintype.'</div>
                                <div class="message-text feed">'.$c['body'].'</div>
                            </div>
                        </div>
                        <div class="pc-compl">
                            <div class="comment-votes-block">
                               
                                <div class="wvote" wid="' . $c['id'] . '">
                                    <a href="#" vote="1" class="w-btn s2"><span>+</span></a>
                                    <div class="w-rating '.$commclass.' active">' . $symb . Vote::countcommrates($c['id'], -1) . '</div>
                                    <div class="w-rating-ext">
                                        <div><span class="pro">+' . Vote::countcommrates($c['id'], 1) . '</span> / <span class="con">' . Vote::countcommrates($c['id'], 0) . '</span></div>
                                    </div>
                                    <a href="#" vote="0" class="w-btn s5"><span>–</span></a>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                </div>';
                }
                ?>

                
               
                <div id="scroll_anchor"></div>
                <script src="/js/endless.js?031021"></script>
                <script>
                    var ltime = 1739362440;
                    var last_k = 20;
                    var st = 20;
                    var cnt = -1;
                    var ajaxQuery = '/comments.php?ajax=1&cnt=-1';
                </script>
                <script>
                    var ftime = 1739367547;

                    function markAllRead(force) {
                        if (confirm('Вы действительно хотите отметить эти комментарии как прочитанные?')) {
                            var ts = force ? 0 : ltime + 1;
                            window.location.href = '?markread=' + ts;
                        }

                        return false;
                    }

                    var k = 20;
                    var new_cnt = 0;

                    function updateTitle() {
                        document.title = (new_cnt ? '(' + new_cnt + ') ' : '') + $('h1').text();
                    }

                    var updateInterval = setInterval(function() {
                        $.get('/comments.php?ajax=1&upd=1', {
                            ltime: ftime
                        }, function(r) {
                            if (!r) return;

                            if (r == 'logout') {
                                clearInterval(updateInterval);
                                document.location.href = '/login.php';
                                return;
                            }

                            if ($(window).scrollTop() > 100) {
                                var diff = $(document).height();
                                var wrapper = $('<div id="wrapper" style="display:none">' + r + '</div>').insertAfter('#upd_anchor');

                                $(window).scrollTop($(window).scrollTop() + wrapper.height());

                                wrapper.show();
                                wrapper.children().eq(0).unwrap();
                            } else $('#upd_anchor').after(r);
                        }, 'html');
                    }, 30000);
                </script>
                <div id="loader-anchor"></div>
            </td>
        </tr>
        <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/Footer.php'); ?>
    </table>

</body>

</html>