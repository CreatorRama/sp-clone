console.log("seeta ram hanuman");

let currentsong = new Audio();
let songs = [];
let currfolder = "";

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs(folder) {
    let fetchURL = `songs/songs.json`;
    console.log(`Fetching songs for folder: ${folder} from URL: ${fetchURL}`);

    try {
        let response = await fetch(fetchURL);
        if (!response.ok) {
            throw new Error(`Failed to fetch songs.json: ${response.statusText}`);
        }

        let json = await response.json();
        let album = json.albums.find(album => album.folder === folder);
        if (!album) {
            throw new Error(`Album not found for folder: ${folder}`);
        }

        let songul = document.querySelector(".songlist ul");
        songul.innerHTML = "";

        songs = album.songs.map(song => song.split('/').pop());
        songs.forEach(song => {
            songul.innerHTML += `<li>
                <img class="invert" src="img/music.svg" alt="">
                <div class="info">
                    <div>${song.replaceAll("%20", " ")}</div>
                    <div>${folder}</div>
                </div>
                <div class="playnow">
                    <span>PlayNow</span>
                    <img class="invert" src="img/play.svg" alt="">
                </div>
            </li>`;
        });

        Array.from(songul.children).forEach(e => {
            e.addEventListener("click", () => {
                const infoElement = e.querySelector(".info");
                if (infoElement.childElementCount > 0) {
                    playmusic(infoElement.firstElementChild.innerHTML);
                }
            });
        });

        return songs;

    } catch (error) {
        console.error(error);
        return [];
    }
}

async function displayalbums() {
    let fetchURL = `songs/songs.json`;
    console.log(`Fetching albums from URL: ${fetchURL}`);

    try {
        let response = await fetch(fetchURL);
        if (!response.ok) {
            throw new Error(`Failed to fetch songs.json: ${response.statusText}`);
        }

        let json = await response.json();
        let albums = json.albums;

        let cardcontainer = document.querySelector(".cardcontainer");
        cardcontainer.innerHTML = "";

        for (let album of albums) {
            let folder = album.folder;
            let fetchInfoURL = album.info;
            console.log(`Fetching album info from URL: ${fetchInfoURL}`);

            try {
                let response = await fetch(fetchInfoURL);
                if (!response.ok) {
                    throw new Error(`Failed to fetch info.json for ${folder}: ${response.statusText}`);
                }

                let info = await response.json();
                cardcontainer.innerHTML += `<div data-folder="${folder}" class="card">
                    <div class="playbutton">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="#000000" height="60px" width="40px" viewBox="0 0 60 60">
                            <g>
                                <path d="M45.563,29.174l-22-15c-0.307-0.208-0.703-0.231-1.031-0.058C22.205,14.289,22,14.629,22,15v30 c0,0.371,0.205,0.711,0.533,0.884C22.679,45.962,22.84,46,23,46c0.197,0,0.394-0.059,0.563-0.174l22-15 C45.836,30.64,46,30.331,46,30S45.836,29.36,45.563,29.174z M24,43.107V16.893L43.225,30L24,43.107z"/>
                                <path d="M30,0C13.458,0,0,13.458,0,30s13.458,30,30,30s30-13.458,30-30S46.542,0,30,0z M30,58C14.561,58,2,45.439,2,30 S14.561,2,30,2s28,12.561,28,28S45.439,58,30,58z"/>
                            </g>
                        </svg>
                    </div>
                    <img src="${album.cover}" alt="">
                    <h2>${info.title}</h2>
                    <p>${info.description}</p>
                </div>`;
            } catch (error) {
                console.error(`Failed to fetch info.json for ${folder}: ${error.message}`);
            }
        }

        Array.from(cardcontainer.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async () => {
                currfolder = e.getAttribute("data-folder");
                console.log(`Loading songs for folder: ${currfolder}`);
                songs = await getsongs(currfolder);
                if (songs.length > 0) {
                    playmusic(songs[0]);
                } else {
                    console.error(`No songs found in folder: ${currfolder}`);
                }
            });
        });

    } catch (error) {
        console.error(error);
    }
}

function setupEventListeners() {
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
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)}:${secondsToMinutesSeconds(currentsong.duration)}`;
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = ((currentsong.duration) * percent) / 100;
        console.log(currentsong.currentTime);
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    document.querySelector("#previous").addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-2)[1]);
        let sl = songs.length;
        if (index == 0) {
            playmusic(songs[index + (sl - 1)]);
        } else {
            playmusic(songs[index - 1]);
        }
    });

    document.querySelector("#next").addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-2)[1]);
        let sl = songs.length;
        if (index == sl - 1) {
            playmusic(songs[index - (sl - 1)]);
        } else {
            playmusic(songs[index + 1]);
        }
    });

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentsong.volume = parseInt(e.target.value) / 100;
        if (currentsong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute", "volume");
        } else {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("volume", "mute");
        }
    });

    document.querySelector(".volume").addEventListener("click", () => {
        if (currentsong.volume > 0) {
            currentsong.volume = 0;
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("volume", "mute");
        } else {
            currentsong.volume = 1;
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute", "volume");
        }
    });
}

function playmusic(song) {
    currentsong.src = `songs/${currfolder}/${song}`;
    currentsong.play();
    document.querySelector('#play').src = "img/pause.svg";
}

window.onload = () => {
    displayalbums();
    setupEventListeners();
}
