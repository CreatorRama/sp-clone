console.log("seeta ram hanuman");

let currentsong = new Audio();
let songs = [];
let folder;
let currfolder;

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
    currfolder = folder;
    let fetchURL = `./${folder}/`;
    console.log(`Fetching songs from URL: ${fetchURL}`);
    let response = await fetch(fetchURL);
    if (!response.ok) {
        console.error(`Failed to fetch ${folder}: ${response.statusText}`);
        return [];
    }

    let text = await response.text();
    let div = document.createElement("div");
    div.innerHTML = text;

    let anchors = div.getElementsByTagName("a");
    songs = [];

    for (let i = 0; i < anchors.length; i++) {
        const element = anchors[i];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    // Display all songs in the list
    let songul = document.querySelector(".songlist ul");
    songul.innerHTML = "";

    songs.forEach(song => {
        songul.innerHTML += `<li>
            <img class="invert" src="img/music.svg" alt="">
            <div class="info">
                <div>${song.replaceAll("%20", " ")}</div>
                <div>Ram</div>
            </div>
            <div class="playnow">
                <span>PlayNow</span>
                <img class="invert" src="img/play.svg" alt="">
            </div>
        </li>`;
    });

    // Attach an event listener to each song
    Array.from(songul.children).forEach(e => {
        e.addEventListener("click", () => {
            const infoElement = e.querySelector(".info");
            if (infoElement.childElementCount > 0) {
                playmusic(infoElement.firstElementChild.innerHTML);
            }
        });
    });

    return songs;
}

const playmusic = (track, pause = false) => {
    console.log(track);
    currentsong.src = `./${currfolder}/` + track;
    console.log("ram");
    if (!pause) {
        currentsong.play();
        document.querySelector(".circle").style.left = 0 + "%";
        document.querySelector("#play").src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = track;
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
}

async function displayalbums() {
    let fetchURL = `./songs/`;
    console.log(`Fetching albums from URL: ${fetchURL}`);
    let response = await fetch(fetchURL);
    if (!response.ok) {
        console.error(`Failed to fetch songs directory: ${response.statusText}`);
        return;
    }

    let text = await response.text();
    let div = document.createElement("div");
    div.innerHTML = text;

    let anchors = div.getElementsByTagName("a");
    let cardcontainer = document.querySelector(".cardcontainer");

    for (let i = 0; i < anchors.length; i++) {
        const e = anchors[i];
        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-2)[1];
            let fetchInfoURL = `./songs/${folder}/info.json`;
            console.log(`Fetching album info from URL: ${fetchInfoURL}`);
            let response = await fetch(fetchInfoURL);
            if (!response.ok) {
                console.error(`Failed to fetch info.json for ${folder}: ${response.statusText}`);
                continue;
            }

            let json = await response.json();
            cardcontainer.innerHTML += `<div data-folder="${folder}" class="card">
                <div class="playbutton">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="#000000" height="60px" width="40px" viewBox="0 0 60 60">
                        <g>
                            <path d="M45.563,29.174l-22-15c-0.307-0.208-0.703-0.231-1.031-0.058C22.205,14.289,22,14.629,22,15v30 c0,0.371,0.205,0.711,0.533,0.884C22.679,45.962,22.84,46,23,46c0.197,0,0.394-0.059,0.563-0.174l22-15 C45.836,30.64,46,30.331,46,30S45.836,29.36,45.563,29.174z M24,43.107V16.893L43.225,30L24,43.107z"/>
                            <path d="M30,0C13.458,0,0,13.458,0,30s13.458,30,30,30s30-13.458,30-30S46.542,0,30,0z M30,58C14.561,58,2,45.439,2,30 S14.561,2,30,2s28,12.561,28,28S45.439,58,30,58z"/>
                        </g>
                    </svg>
                </div>
                <img src="songs/${folder}/cover.jpeg" alt="">
                <h2>${json.title}</h2>
                <p>${json.description}</p>
            </div>`;
        }
    }

    // Load the playlist whenever a card is clicked
    Array.from(cardcontainer.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async () => {
            folder = e.getAttribute("data-folder");
            songs = await getsongs(`songs/${folder}`);
            if (songs.length > 0) {
                playmusic(songs[0]);  // Play the first song of that album whenever the card is loaded
            } else {
                console.error(`No songs found in folder: ${folder}`);
            }
        });
    });
}

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

  
    currentsong.addEventListener("timeupdate",()=>{
        // console.log(currentsong.currentTime,currentsong.duration);
        document.querySelector(".songtime").innerHTML=`${secondsToMinutesSeconds(currentsong.currentTime)}:${secondsToMinutesSeconds(currentsong.duration)}`;
        document.querySelector(".circle").style.left=(currentsong.currentTime/currentsong.duration)*100+"%";
    })
    
    // add event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click",e=>{
        let percent=(e.offsetX/e.target.getBoundingClientRect().width)*100;
        document.querySelector(".circle").style.left=percent+"%";
        currentsong.currentTime=((currentsong.duration)*percent)/100;
        console.log(currentsong.currentTime);
    })

    // Add more event listeners as needed

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
        if (index == 0) {
            playmusic(songs[index + (sl - 1)]);
        } else {
            playmusic(songs[index - 1]);
        }
    });

    // Add event listener for next song
    document.querySelector("#next").addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-2)[1]);
        let sl = songs.length;
        if (index == sl - 1) {
            playmusic(songs[index - (sl - 1)]);
        } else {
            playmusic(songs[index + 1]);
        }
    });


    // add an event listener for volume change
document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
    // console.log(e.target,e.target.value);
    // console.log("current volume is",e.target.value);
    
//    console.log(currentsong.volume=parseInt(e.target.value)/100);
   currentsong.volume=parseInt(e.target.value)/100;
   if(currentsong.volume>0){
    document.querySelector(".volume>img").src=document.querySelector(".volume>img").src.replace("mute.svg","volume.svg");
   }
    
})

// display volume input when touch
document.querySelector(".volume").addEventListener("click",()=>{
    document.querySelector(".range").getElementsByTagName("input")[0].style.display="block";
})

// add an event listener to mute the volume
document.querySelector(".volume>img").addEventListener("click",e=>{
    console.log(e.target);
    if(e.target.src.includes("volume.svg")){
        e.target.src=e.target.src.replace("volume.svg","mute.svg");
        currentsong.volume=0;
        document.querySelector(".range").getElementsByTagName("input")[0].style.display="block";
        document.querySelector(".range").getElementsByTagName("input")[0].value=0;
    }
    else{
        e.target.src=e.target.src.replace("mute.svg","volume.svg");
        currentsong.volume=0.2;
        document.querySelector(".range").getElementsByTagName("input")[0].value=20

    }
    
})


}

function main() {
    displayalbums();
    setupEventListeners();
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded and parsed");
    main();
});

       
