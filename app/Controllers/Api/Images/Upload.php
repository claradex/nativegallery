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

    public static function create($postbody, $content, $exif)
    {
        $user = new \App\Models\User(Auth::userid());
        if (NGALLERY['root']['photo']['upload']['premoderation'] === true) {
            if ($user->content('premoderation') === true) {
                $moderated = 1;
            } else {
                $moderated = 0;
            }
        } else {
            $moderated = 1;
        }
        DB::query('INSERT INTO photos VALUES (\'0\', :userid, :postbody, :photourl, :time, :timeup, :exif, 0, :moderated, :place, :content)', array(':postbody' => $postbody, ':userid' => Auth::userid(), ':time' =>  mktime(0, 0, 0, $_POST['month'], $_POST['day'], $_POST['year']), ':content' => $content, ':photourl' => self::$photourl, ':exif' => $exif, ':place' => $_POST['place'], ':timeup'=>time(), ':moderated'=>$moderated));
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
            if (isset($_POST['nomap'])) {
                $_POST['lat'] = null;
                $_POST['lng'] = null;
            }
            if ($upload->getType() !== null) {
                $content = Json::return(
                    array(
                        'type' => 'none',
                        'copyright' => $_POST['license'],
                        'comment' => $_POST['descr'],
                        'lat' => $_POST['lat'],
                        'lng' => $_POST['lng']
                    )
                );
                self::$photourl = $upload->getSrc();
                self::create($_POST['descr'], $content, $exif);
            }
        } else {
            echo json_encode(
                array(
                    'errorcode' => 'FILE_NOTSELECTED',
                    'error' => 1
                )
            );
        }
    }
}