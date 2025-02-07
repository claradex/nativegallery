<?php

namespace App\Controllers\Api\Images\Comments;

use App\Services\{Auth, Router, GenerateRandomStr, DB, Json, Files, Shell};
use App\Models\Notification;
use App\Services\Upload as Upload;
class Create
{


    static $filesrc;
    private static function create($content, $id)
    {
        DB::query('INSERT INTO photos_comments VALUES (\'0\', :userid, :postid, :postbody, :time, :content)', array('postid' => $_POST['id'], ':postbody' => $_POST['wtext'], ':userid' => Auth::userid(), ':time' => time(), ':content'=>$content));
    }
    public function __construct()
    {
        $id = $_POST['id'];
        $postbody = $_POST['wtext'];
        if ((int)$id === DB::query('SELECT id FROM photos WHERE id=:id', array(':id' => $id))[0]['id']) {


            if ($_FILES['filebody']['error'] != 4) {
                $finfo = finfo_open(FILEINFO_MIME_TYPE);
                $mime = finfo_file($finfo, $_FILES['filebody']['tmp_name']);
                finfo_close($finfo);
                $filename = GenerateRandomStr::gen_uuid();
                if (preg_match('/^image\//', $mime)) {
                    $info = getimagesize($_FILES['filebody']['tmp_name']);

                    if ($info['mime'] == 'image/jpeg')
                        $image = imagecreatefromjpeg($_FILES['filebody']['tmp_name']);
                    elseif ($info['mime'] == 'image/gif')
                        $image = imagecreatefromgif($_FILES['filebody']['tmp_name']);
                    elseif ($info['mime'] == 'image/png')
                        $image = imagecreatefrompng($_FILES['filebody']['tmp_name']);
                    $type = 'img';
                    $destination = '/cdn/temp/'.$filename.'.jpg';
                    imagejpeg($image, $_SERVER['DOCUMENT_ROOT'].$destination, 60);

                } else if (preg_match('/^audio\//', $mime)) {
                    return "Аудио";
                } else if (preg_match('/^video\//', $mime)) {
                    if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
                        $ffmpeg = \FFMpeg\FFMpeg::create(array(
                            'ffmpeg.binaries'  => $_SERVER['DOCUMENT_ROOT'] . '/app/Controllers/Exec/ffmpeg.exe',
                            'ffprobe.binaries' => $_SERVER['DOCUMENT_ROOT'] . '/app/Controllers/Exec/ffprobe.exe',
                            'timeout'          => 3600, // The timeout for the underlying process
                            'ffmpeg.threads'   => 12,   // The number of threads that FFMpeg should use
                        ), $logger);
                    } else {
                        $ffmpeg = \FFMpeg\FFMpeg::create();
                    }
                    $video = $ffmpeg->open($_FILES['filebody']['tmp_name']);
                    $video->save(new \FFMpeg\Format\Video\X264(), $_SERVER['DOCUMENT_ROOT'] . "/cdn/temp/" . $filename . '.mp4');
                    $video->frame(\FFMpeg\Coordinate\TimeCode::fromSeconds(1))->save($_SERVER['DOCUMENT_ROOT'] . "/cdn/temp/VIDPRV_" . $filename . '.jpg');
                    $type = 'video';
                    $destination = '/cdn/temp/'.$filename.'.mp4';
                    $destination_vidprv = '/cdn/temp/VIDPRV'.$filename.'.jpg';
                } else {
                    return "Неизвестный тип файла";
                }

                $upload = new Upload($_SERVER['DOCUMENT_ROOT'].$destination, 'cdn/'.$type.'/');
                self::$filesrc = $upload->getSrc();
            }


            if ((strlen($postbody) < 4096 || strlen($postbody) > 1) || $_FILES['filebody']['error'] != 4) {
                if (trim($postbody) != '' || $_FILES['filebody']['error'] != 4) {
                    $postbody = ltrim($postbody);
                    echo json_encode(
                        array(
                            'errorcode' => '0',
                            'error' => 0
                        )
                    );
                } else {
                    die(json_encode(
                        array(
                            'errorcode' => '1',
                            'error' => 1
                        )
                    ));
                }
            } else {
                die(json_encode(
                    array(
                        'errorcode' => '2',
                        'error' => 1
                    )
                ));
            }
            $content = Json::return(
                array(
                    'type' => 'none',
                    'by' => 'user',
                    'filetype' => $type,
                    'src' => self::$filesrc
                )
            );
            self::create($content, $id);
        } else {
            die(json_encode(
                array(
                    'errorcode' => '3',
                    'error' => 1
                )
            ));
        }
    }
}
