function setupEventListeners() {
    // Play/Pause button event listener
    const playPauseButton = document.querySelector('#play');
    playPauseButton.addEventListener('click', () => {
        if (currentsong.paused) {
            currentsong.play();
            playPauseButton.src = "img/pause.svg";
        } else {
            currentsong.pause();
            playPauseButton.src = "img/play.svg";
        }
    });

    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)} / ${secondsToMinutesSeconds(currentsong.duration)}`;
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    });

    // Seekbar functionality
    const seekbar = document.querySelector(".seekbar");
    let isSeeking = false;

    // Function to handle seeking
    function seek(e) {
        const seekbarRect = seekbar.getBoundingClientRect();
        const clientX = e.clientX || (e.touches ? e.touches[0].clientX : 0);
        const percent = (clientX - seekbarRect.left) / seekbarRect.width * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = (currentsong.duration * percent) / 100;
    }

    // Mouse events
    seekbar.addEventListener("mousedown", (e) => {
        isSeeking = true;
        seek(e);
    });

    seekbar.addEventListener("mousemove", (e) => {
        if (isSeeking) {
            seek(e);
        }
    });

    seekbar.addEventListener("mouseup", (e) => {
        isSeeking = false;
        seek(e);
    });

    seekbar.addEventListener("mouseleave", () => {
        isSeeking = false;
    });

    // Touch events
    seekbar.addEventListener("touchstart", (e) => {
        isSeeking = true;
        seek(e);
    });

    seekbar.addEventListener("touchmove", (e) => {
        if (isSeeking) {
            seek(e);
        }
    });

    seekbar.addEventListener("touchend", (e) => {
        isSeeking = false;
        seek(e);
    });

    // Add event listener to hamburger for opening left
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    // Add event listener for closing hamburger
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    // Add event listener for previous song
    document.querySelector("#previous").addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-2)[1]);
        let sl = songs.length;
        if (index === 0) {
            playmusic(songs[index + (sl - 1)]);
        } else {
            playmusic(songs[index - 1]);
        }
    });

    // Add event listener for next song
    document.querySelector("#next").addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-2)[1]);
        let sl = songs.length;
        if (index === (sl - 1)) {
            playmusic(songs[index - (sl - 1)]);
        } else {
            playmusic(songs[index + 1]);
        }
    });
}

setupEventListeners();
displayalbums();
