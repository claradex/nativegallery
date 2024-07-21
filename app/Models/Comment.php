<?php
namespace App\Models;
use \App\Services\{DB, Date};
use \App\Models\{User, Photo, Vote};

class Comment {

    public $commentid;
    public $c;
    public $class;
    function __construct($user_id) {
        $this->c = $user_id;
    }
    public function class($class) {
        $this->class = $class;
    }
    public function i() {
        $user = new User($this->c['user_id']);
        echo '<div class="'.$this->class.' comment" wid="'.$this->c['id'].'">
                                <div style="float:right; text-align:right" class="sm">
                                    <span class="message_date">'.Date::zmdate($this->c['posted_at']).'</span><br>
                                    <a href="#" class="quoteLink dot">Цитировать</a>
                                     · 
                                     <a href="#'.$this->c['id'].'" class="cmLink dot">Ссылка</a>
                                </div>
                                <a name="2681468"></a><a name="last"></a>
                                <div><img src="'.$user->i('photourl').'" width="32" style="border-radius: 3px; margin-right: 5px;"><b><a href="/author/'.$this->c['user_id'].'/" class="message_author">'.htmlspecialchars($user->i('username')).'</a></b> &middot; 
                                <span class="flag">';
                                if (json_decode($user->i('content'), true)['aboutrid']['value'] != null) {
                                    echo '<img src="https://kamenphoto.ru/img/r/'.json_decode($user->i('content'), true)['aboutrid']['value'].'.gif">';
                                 }
                                 if (json_decode($user->i('content'), true)['aboutlive']['value'] != null) {
                                 echo ' '.htmlspecialchars(json_decode($user->i('content'), true)['aboutlive']['value']);
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
                                <div class="rank">Фото: '.Photo::fetchAll($this->c['user_id']).' '.$admintype.'</div>
                                <div class="message-text">'.htmlspecialchars($this->c['body']).'</div>
                                <div class="comment-votes-block">
                                    <div class="wvote" wid="'.$this->c['id'].'">
                                    <a href="#" vote="1" class="w-btn s2"><span>+</span></a>
                                        <div class="w-rating '.$commclass.' active">'.$symb.Vote::countcommrates($this->c['id'], -1).'</div>
                                        <div class="w-rating-ext">
                                            <div><span class="pro">+'.Vote::countcommrates($this->c['id'], 1).'</span> / <span class="con">'.Vote::countcommrates($this->c['id'], 0).'</span></div>
                                        </div>
                                        <a href="#" vote="0" class="w-btn s5"><span>–</span></a>
                                    </div>
                                </div>
                            </div>';
    }


}