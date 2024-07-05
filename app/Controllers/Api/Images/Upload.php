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
        DB::query('INSERT INTO photos VALUES (\'0\', :userid, :postbody, :photourl, :time, :exif, 0, :place, :content)', array(':postbody' => $postbody, ':userid' => Auth::userid(), ':time' =>  mktime(0, 0, 0, $_POST['month'], $_POST['day'], $_POST['year']), ':content' => $content, ':photourl' => self::$photourl, ':exif' => $exif, ':place' => $_POST['place']));
        echo json_encode(
            array(
                'errorcode' => 0,
                'error' => 0
            )
        );
    }
    public function __construct()
    {   

        if ($_FILES['image']['error'] != 4) {
            $exif = new EXIF($_FILES['image']['tmp_name']);
            $upload = new UploadPhoto($_FILES['image'], 'cdn/img');
            if ($upload->getType() !== null) {
                $content = Json::return(
                    array(
                        'type' => 'none',
                        'copyright' => $_POST['license'],
                        'comment' => $_POST['comment'],
                    )
                );
                self::$photourl = $upload->getSrc();
                self::create($_POST['descr'], $content, $exif->getData());
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