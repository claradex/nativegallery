const audio = document.getElementById("audio");
        const playPause = document.getElementById("playPause");
        const progressBar = document.getElementById("progressBar");
        const progress = progressBar.querySelector("span");
        const timeDisplay = document.getElementById("time");

        playPause.addEventListener("click", () => {
            if (audio.paused) {
                audio.play();
                playPause.textContent = "⏸";
            } else {
                audio.pause();
                playPause.textContent = "▶";
            }
        });

        audio.addEventListener("timeupdate", () => {
            const currentTime = audio.currentTime;
            const duration = audio.duration;
            const progressPercent = (currentTime / duration) * 100;
            progress.style.width = progressPercent + "%";

            const formatTime = (time) => {
                const minutes = Math.floor(time / 60);
                const seconds = Math.floor(time % 60).toString().padStart(2, '0');
                return `${minutes}:${seconds}`;
            };

            timeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
        });

        progressBar.addEventListener("click", (e) => {
            const rect = progressBar.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const progressWidth = rect.width;
            const newTime = (clickX / progressWidth) * audio.duration;
            audio.currentTime = newTime;
        });
