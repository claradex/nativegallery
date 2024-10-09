<?php

namespace App\Controllers\Api\Images;



use App\Services\{Auth, Router, GenerateRandomStr, DB, Json, EXIF};
use App\Services\Upload as UploadPhoto;
use \Aws\S3\MultipartUploader;
use \Aws\Exception\MultipartUploadException;


class Upload
{
    static $continue;
    static $photourl;
    static $vidpreview;
    static $videourl;
    static $comments = 'allowed';
    static $rating = 'allowed';
    static $showtop = 'allowed';
    static $subsnotify = 'allowed';

    public static function create($postbody, $content, $exif)
    {
        $user = new \App\Models\User(Auth::userid());
        if (NGALLERY['root']['photo']['upload']['premoderation'] === true) {
            if ($user->content('premoderation') === "true" || $user->i('admin') > 0) {
                $moderated = 1;
            } else {
                $moderated = 0;
            }
        } else {
            $moderated = 1;
        }
        DB::query('INSERT INTO photos VALUES (\'0\', :userid, :postbody, :photourl, :time, :timeup, :exif, 0, :moderated, :place, 0, :gallery, :content)', array(':postbody' => $postbody, ':userid' => Auth::userid(), ':time' =>  mktime(0, 0, 0, $_POST['month'], $_POST['day'], $_POST['year']), ':content' => $content, ':photourl' => self::$photourl, ':exif' => $exif, ':place' => $_POST['place'], ':timeup' => time(), ':moderated' => $moderated, ':gallery'=>$_POST['gallery']));
        if (($moderated === 1) && (self::$subsnotify != 'disabled')) {
            $followers = DB::query('SELECT * FROM followers WHERE user_id=:uid', array(':uid' => Auth::userid()));
            foreach ($followers as $f) {
                DB::query('INSERT INTO followers_notifications VALUES (\'0\', :uid, :fid, :pid, 0)', array(':uid' => Auth::userid(), ':fid' => $f['follower_id'], ':pid' => DB::query('SELECT * FROM photos ORDER BY id DESC LIMIT 1')[0]['id']));
            }
        }
        echo json_encode(
            array(
                'id' => DB::query('SELECT id FROM photos ORDER BY id DESC LIMIT 1')[0]['id'],
                'errorcode' => 0,
                'error' => 0
            )
        );
    }
    public function __construct()
    {

        if ($_FILES['image']['error'] != 4) {
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $type = finfo_file($finfo, $_FILES['image']['tmp_name']);
            if ($type === 'image/gif') {
                if (NGALLERY['root']['photo']['upload']['allowgif'] === false) {
                    echo json_encode(
                        array(
                            'errorcode' => 'FILE_NOTSUPPORTED',
                            'error' => 1
                        )
                    );
                    die();
                }
            }
            if (explode('/', $type)[0] === 'video') {
                $newname = GenerateRandomStr::init(64);
                $ffmpegPath = strtoupper(substr(PHP_OS, 0, 3)) === 'WIN' ? 'E:\Maksim\kandle\app\Controllers\Video\Exec\ffmpeg.exe' : 'ffmpeg';
                $tempDir = $_SERVER['DOCUMENT_ROOT'] . '/cdn/temp/';
                $mp4File = $tempDir . $newname . '.mp4';
                $ffmpegCommand = "$ffmpegPath -i " . $_FILES['image']['tmp_name'] . " -c:v libx264 -crf 18 -fpsmax 60 -preset fast -c:a aac -ac 2 -codec:v copy -codec:a copy $mp4File";
                exec($ffmpegCommand);

                $thumbnailFile = $tempDir . $newname . '.jpg';

                $ffmpegCommand = "$ffmpegPath -i " . $_FILES['image']['tmp_name'] . " -ss 00:00:00 -frames:v 1 -q:v 2 $thumbnailFile";
                exec($ffmpegCommand);

                $backgroundImagePath = $thumbnailFile;
                $overlayImagePath = $_SERVER['DOCUMENT_ROOT'] . '/static/img/playic.png';

                $background = imagecreatefromjpeg($backgroundImagePath);
                $overlay = imagecreatefrompng($overlayImagePath);

                $backgroundWidth = imagesx($background);
                $backgroundHeight = imagesy($background);
                $overlayWidth = imagesx($overlay);
                $overlayHeight = imagesy($overlay);

                $destX = ($backgroundWidth - $overlayWidth) / 2;
                $destY = ($backgroundHeight - $overlayHeight) / 2;

                imagecopy($background, $overlay, $destX, $destY, 0, 0, $overlayWidth, $overlayHeight);

                $outputImagePath = $_SERVER['DOCUMENT_ROOT'] . '/cdn/temp/VIDPRV_' . $newname . '.jpg';
                imagejpeg($background, $outputImagePath, 90);
                imagedestroy($background);
                imagedestroy($overlay);
                
                $upload = new UploadPhoto($outputImagePath, 'cdn/img/');
                self::$vidpreview = $upload->getSrc();
                $upload = new UploadPhoto($mp4File, 'cdn/video/');
                echo explode($mp4File, '.')[1];
                self::$videourl = $upload->getSrc();
                $exif = Json::return(
                    array(
                        'type' => 'none',
                    )
                );
            } else if (explode('/', $type)[0] === 'image') {


                $exif = new EXIF($_FILES['image']['tmp_name']);
                $exif = $exif->getData();
                $upload = new UploadPhoto($_FILES['image'], 'cdn/img/');
                if ($exif === null) {
                    $exif = Json::return(
                        array(
                            'type' => 'none',
                        )
                    );
                }
            } else {
                echo json_encode(
                    array(
                        'errorcode' => 'FILE_NOTSELECTED',
                        'error' => 1
                    )
                );
            }
            if (isset($_POST['nomap'])) {
                $_POST['lat'] = null;
                $_POST['lng'] = null;
            }
            if ((int)$_POST['disablecomments'] === 1) {
                self::$comments = 'disabled';
            }
            if ((int)$_POST['disablerating'] === 1) {
                self::$rating = 'disabled';
            }
            if ((int)$_POST['disableshowtop'] === 1) {
                self::$showtop = 'disabled';
            }
            if ((int)$_POST['disablesubsnotify'] === 1) {
                self::$subsnotify = 'disabled';
            }
            if ($upload->getType() !== null) {
                $content = Json::return(
                    array(
                        'type' => explode('/', $type)[0],
                        'videourl' => self::$videourl,
                        'copyright' => $_POST['license'],
                        'comment' => $_POST['descr'],
                        'lat' => $_POST['lat'],
                        'lng' => $_POST['lng'],
                        'comments' => self::$comments,
                        'rating' => self::$rating,
                        'showtop' => self::$showtop,
                    )
                );
                if (explode('/', $type)[0] === 'video') {
                    self::$photourl = self::$vidpreview;
                } else {
                    self::$photourl = $upload->getSrc();
                }
                self::create($_POST['descr'], $content, $exif);
            }
        }
    }
}
