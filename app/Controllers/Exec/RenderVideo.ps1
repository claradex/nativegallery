
$tempfile = $args[0]
$weburl   = $args[1]
$id = $args[2]

#$tempfile = 'G:\video.mp4'
#$weburl = 'kandle.loc'
#$id = '40'

$hash   = -join (((48..57)+(65..90)+(97..122)) * 80 |Get-Random -Count 32 |%{[char]$_})
$hashT   = -join (((48..57)+(65..90)+(97..122)) * 80 |Get-Random -Count 222 |%{[char]$_})
$temp    = [System.IO.Path]::GetTempFileName()

$shell = Get-WmiObject Win32_process -filter "ProcessId = $PID"
$shell.SetPriority(16384)

Copy-Item $tempfile E:\$hash

E:\Maksim\kandle\app\Controllers\Video\Exec\ffmpeg.exe -i E:\$hash -c:v libx264 -q:v 7 -c:a libmp3lame -q:a 4 -tune zerolatency -y C:\kandletemp\$hashT.mp4

$uri = 'http://'+$weburl+'/api/video/exec/upload?file=C:\kandletemp\'+$hashT+'.mp4&videoid='+$id

Invoke-WebRequest -Uri $uri

Remove-Item C:\kandletemp\$hashT.mp4


