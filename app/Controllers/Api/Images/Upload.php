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
        DB::query('INSERT INTO photos VALUES (\'0\', :userid, :postbody, :photourl, :time, :exif, 0, :content, :country, :city)', array(':postbody' => $postbody, ':userid' => Auth::userid(), ':time' =>  mktime(0, 0, 0, $_POST['month'], $_POST['day'], $_POST['year']), ':content' => $content, ':photourl' => self::$photourl, ':exif' => $exif, ':country' => $_POST['country'], ':city' => $_POST['city']));
        echo json_encode(
            array(
                'errorcode' => 0,
                'error' => 0
            )
        );
    }
    public function __construct()
    {   

        if ($_FILES['filebody']['error'][0] != 4) {
            $exif = new EXIF($_FILES['filebody']['tmp_name']);
            $upload = new UploadPhoto($_FILES['filebody'], 'cdn/img');
            if ($upload['type'] !== null) {
                $content = Json::return(
                    array(
                        'type' => 'none'
                    )
                );
                self::$photourl = $upload['src'];
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