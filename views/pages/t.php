<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mini Vidéoplayer</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; }
        .player { width: 60%; margin: auto; position: relative; }
        video { width: 100%; display: block; }
        .controls { display: flex; align-items: center; justify-content: space-between; padding: 10px; background: #333; color: white; }
        .controls button { background: none; border: none; color: white; cursor: pointer; }
        .progress-bar { width: 100%; height: 5px; background: gray; position: relative; cursor: pointer; }
        .progress { width: 0%; height: 100%; background: red; position: absolute; }
    </style>
</head>
<body>
    <div class="player">
        <video id="video" src="video.mp4"></video>
        <div class="controls">
            <button id="playPause">▶</button>
            <input type="range" id="volume" min="0" max="1" step="0.1" value="1">
            <button id="fullscreen">⛶</button>
        </div>
        <div class="progress-bar" id="progressBar">
            <div class="progress" id="progress"></div>
        </div>
    </div>
    <script>
        const video = document.getElementById('video');
        const playPause = document.getElementById('playPause');
        const volume = document.getElementById('volume');
        const progressBar = document.getElementById('progressBar');
        const progress = document.getElementById('progress');
        const fullscreen = document.getElementById('fullscreen');
        
        playPause.addEventListener('click', () => {
            if (video.paused) {
                video.play();
                playPause.textContent = '⏸';
            } else {
                video.pause();
                playPause.textContent = '▶';
            }
        });
        
        volume.addEventListener('input', () => {
            video.volume = volume.value;
        });
        
        video.addEventListener('timeupdate', () => {
            const progressPercent = (video.currentTime / video.duration) * 100;
            progress.style.width = progressPercent + '%';
        });
        
        progressBar.addEventListener('click', (e) => {
            const newTime = (e.offsetX / progressBar.offsetWidth) * video.duration;
            video.currentTime = newTime;
        });
        
        fullscreen.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                video.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        });
    </script>
</body>
</html>
