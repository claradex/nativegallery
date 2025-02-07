tmpfile="$RANDOM-$(date +%s%N)"
copyfile="$0"
weburl="$1"
videoid="$2"

#copyfile='/var/www/fastuser/data/www/kandle.cats.ovh/video.mp4'
#weburl='kandle.loc'
#videoid='1'

cp $1 "/tmp/vid_$tmpfile.bin"

nice -n 20 ffmpeg -i "/tmp/vid_$tmpfile.bin" -c:v libx264 -q:v 7 -c:a libmp3lame -q:a 4 -tune zerolatency -y "$4/cdn/temp/ffmOi$tmpfile.mp4"

curl "http://$2/api/video/exec/upload?file=$4/cdn/temp/ffmOi$tmpfile.mp4&videoid=$3"
