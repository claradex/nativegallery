<?php
namespace App\Models;
use \App\Services\{DB, Date};
use \App\Models\{User, Photo};

class Comment {

    public $commentid;
    public $c;
    function __construct($user_id) {
        $this->c = $user_id;
    }
    public function i() {
        $user = new User($this->c['user_id']);
        echo '<div class="s11 comment" wid="2681468">
                                <div style="float:right; text-align:right" class="sm">
                                    <span class="message_date">'.Date::zmdate($this->c['posted_at']).'</span><br>
                                </div>
                                <a name="2681468"></a><a name="last"></a>
                                <div><img src="'.$user->i('photourl').'" width="32" style="border-radius: 3px; margin-right: 5px;"><b><a href="/author/'.$this->c['user_id'].'/" class="message_author">'.$user->i('username').'</a></b> &middot; 
                                <span class="flag">';
                                if (json_decode($user->i('content'), true)['aboutrid']['value'] != null) {
                                    echo '<img src="https://kamenphoto.ru/img/r/'.json_decode($user->i('content'), true)['aboutrid']['value'].'.gif">';
                                 }
                                 if (json_decode($user->i('content'), true)['aboutlive']['value'] != null) {
                                 echo ' '.json_decode($user->i('content'), true)['aboutlive']['value'];
                                 }
                                 echo '</span></div>
                                <div class="rank">Фото: '.Photo::fetchAll($this->c['user_id']).'</div>
                                <div class="message-text">'.$this->c['body'].'</div>
                                <div class="comment-votes-block">
                                    <div class="wvote" wid="'.$this->c['id'].'">
                                        <div class="w-rating pro">+1</div>
                                        <div class="w-rating-ext">
                                            <div><span class="pro">+1</span> / <span class="con">–0</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>';
    }


}