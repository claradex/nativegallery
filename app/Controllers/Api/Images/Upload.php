<?php

namespace App\Controllers\Api\Images;

use App\Services\{Auth, Router, GenerateRandomStr, DB, Json, EXIF};
use App\Services\Upload as UploadPhoto;
use \Aws\S3\MultipartUploader;
use \Aws\Exception\MultipartUploadException;

class Upload
{
    private $continue;
    private $photourl;
    private $vidpreview;
    private $videourl;
    private $comments = 'allowed';
    private $rating = 'allowed';
    private $showtop = 'allowed';
    private $subsnotify = 'allowed';
    private $exif = 'exif';
    private $entitydata_id = 0;
    private $entityroute = null;
    private $entitycomment = null;

    private function create($postbody, $content, $exif)
    {
        $user = new \App\Models\User(Auth::userid());
        $moderated = NGALLERY['root']['photo']['upload']['premoderation'] === true
            ? (($user->content('premoderation') === "true" || $user->i('admin') > 0) ? 1 : 0)
            : 1;

        DB::query('INSERT INTO photos VALUES (\'0\', :userid, :postbody, :photourl, :time, :timeup, :exif, 0, :moderated, :place, 0, :gallery, :entityid, 0, 0, 0, :content)', array(
            ':postbody' => $postbody,
            ':userid' => Auth::userid(),
            ':time' => mktime(0, 0, 0, $_POST['month'], $_POST['day'], $_POST['year']),
            ':content' => $content,
            ':photourl' => $this->photourl,
            ':exif' => $exif,
            ':place' => $_POST['place'],
            ':timeup' => time(),
            ':moderated' => $moderated,
            ':gallery' => $_POST['gallery'],
            ':entityid' => $this->entitydata_id
        ));

        if ($moderated === 1 && $this->subsnotify != 'disabled') {
            $followers = DB::query('SELECT * FROM followers WHERE user_id=:uid', array(':uid' => Auth::userid()));
            $photoId = DB::query('SELECT id FROM photos ORDER BY id DESC LIMIT 1')[0]['id'];
            foreach ($followers as $f) {
                DB::query('INSERT INTO followers_notifications VALUES (\'0\', :uid, :fid, :pid, 0)', array(
                    ':uid' => Auth::userid(),
                    ':fid' => $f['follower_id'],
                    ':pid' => $photoId
                ));
            }
        }

        echo json_encode([
            'id' => DB::query('SELECT id FROM photos ORDER BY id DESC LIMIT 1')[0]['id'],
            'errorcode' => 0,
            'error' => 0
        ]);
    }

    public function __construct()
    {
        if ($_FILES['image']['error'] == 4) {
            return;
        }

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $type = finfo_file($finfo, $_FILES['image']['tmp_name']);
        finfo_close($finfo);

        $upload = null;
        $exif = null;

        if ($type === 'image/gif' && NGALLERY['root']['photo']['upload']['allowgif'] === false) {
            echo json_encode(['errorcode' => 'FILE_NOTSUPPORTED', 'error' => 1]);
            return;
        }

        if (explode('/', $type)[0] === 'video') {
            $newname = GenerateRandomStr::init(64);
            $ffmpegPath = strtoupper(substr(PHP_OS, 0, 3)) === 'WIN' ? 'E:\Maksim\kandle\app\Controllers\Video\Exec\ffmpeg.exe' : 'ffmpeg';
            $tempDir = $_SERVER['DOCUMENT_ROOT'] . '/cdn/temp/';
            $mp4File = $tempDir . $newname . '.mp4';

            exec("$ffmpegPath -i {$_FILES['image']['tmp_name']} -c:v libx264 -crf 18 -fpsmax 60 -preset fast -c:a aac -ac 2 -codec:v copy -codec:a copy $mp4File");

            $thumbnailFile = $tempDir . $newname . '.jpg';
            exec("$ffmpegPath -i {$_FILES['image']['tmp_name']} -ss 00:00:00 -frames:v 1 -q:v 2 $thumbnailFile");

            $background = imagecreatefromjpeg($thumbnailFile);
            $overlay = imagecreatefrompng($_SERVER['DOCUMENT_ROOT'] . '/static/img/playic.png');

            $destX = (imagesx($background) - imagesx($overlay)) / 2;
            $destY = (imagesy($background) - imagesy($overlay)) / 2;
            imagecopy($background, $overlay, $destX, $destY, 0, 0, imagesx($overlay), imagesy($overlay));

            $outputImagePath = $_SERVER['DOCUMENT_ROOT'] . '/cdn/temp/VIDPRV_' . $newname . '.jpg';
            imagejpeg($background, $outputImagePath, 90);
            imagedestroy($background);
            imagedestroy($overlay);

            $upload = new UploadPhoto($outputImagePath, 'cdn/img/');
            $this->vidpreview = $upload->getSrc();

            $upload = new UploadPhoto($mp4File, 'cdn/video/');
            $this->videourl = $upload->getSrc();

            $exif = Json::return(['type' => 'none']);
        } elseif (explode('/', $type)[0] === 'image') {
            $exif = new EXIF($_FILES['image']['tmp_name']);
            $exif = $exif->getData();
            $upload = new UploadPhoto($_FILES['image'], 'cdn/img/');
            if ($exif === null) {
                $exif = Json::return(['type' => 'none']);
            }
        } else {
            echo json_encode(['errorcode' => 'FILE_NOTSELECTED', 'error' => 1]);
            return;
        }

        if (isset($_POST['nomap'])) {
            $_POST['lat'] = null;
            $_POST['lng'] = null;
        }

        if ((int)$_POST['disablecomments'] === 1) $this->comments = 'disabled';
        if ((int)$_POST['disablerating'] === 1) $this->rating = 'disabled';
        if ((int)$_POST['disableshowtop'] === 1) $this->showtop = 'disabled';
        if ((int)$_POST['disablesubsnotify'] === 1) $this->subsnotify = 'disabled';
        if ((int)$_POST['disableexif'] === 1) $this->exif = 'disabled';

        if ((int)$_POST['nid'] >= 1) {
            $ent = DB::query('SELECT id FROM entities_data WHERE id=:id', [':id' => $_POST['nid']]);
            if (!empty($ent)) {
                $this->entitydata_id = $_POST['nid'];
                $this->entityroute = $_POST["route"][$_POST['nid']];
                $this->entitycomment = $_POST["notes"][$_POST['nid']];
            } else {
                return;
            }
        }

        if ($upload && $upload->getType() !== null) {
            $content = Json::return([
                'type' => explode('/', $type)[0],
                'videourl' => $this->videourl,
                'copyright' => $_POST['license'],
                'comment' => $_POST['descr'],
                'lat' => $_POST['lat'],
                'lng' => $_POST['lng'],
                'comments' => $this->comments,
                'rating' => $this->rating,
                'showtop' => $this->showtop,
                'entityroute' => $this->entityroute,
                'entitycomment' => $this->entitycomment
            ]);

            $this->photourl = (explode('/', $type)[0] === 'video') ? $this->vidpreview : $upload->getSrc();

            $this->create($_POST['descr'], $content, $exif);
        }
    }
}
