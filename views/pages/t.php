<?php

$videoFile = $_SERVER['DOCUMENT_ROOT'].'/static/2.mp4';
$ffmpegPath = 'E:\Maksim\kandle\app\Controllers\Video\Exec\ffmpeg.exe';
$output = exec($ffmpegPath. ' -i' .$vid, $outputt);
var_dump($output);