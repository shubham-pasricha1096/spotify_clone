console.log('Lets write JavaScript');

let currentSong = new Audio();
let songs;
let currFolder ;

function formatTime(seconds) {
    if(isNaN(seconds) || seconds <0){
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60)

    const formattedMinutes = String(minutes).padStart(2,'0');
    const formattedSeconds = String(remainingSeconds).padStart(2,'0');

    return `${formattedMinutes} : ${formattedSeconds}`
} 

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = []

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) { 
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }
    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML += `
        <li>
            <img src="img/music.svg" alt="">
            <div class="info">
                <div>${song.replaceAll("%20", " ")}</div>
                <div>Shubham</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="img/play.svg" alt="">
            </div>
        </li>`;
    }

    // Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            const track = e.querySelector(".info").firstElementChild.innerHTML.trim();
            playMusic(track);
        })
    })
    return songs
}

const playMusic = (track,pause=false) => {
    currentSong.src = `/${currFolder}/` + track
    if(!pause){
        currentSong.play()
        play.src= "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}
async function displayAlbums(){
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if(e.href.includes("/songs/") && !e.href.includes(".htaccess")){
           let folder = e.href.split("/").slice(-1)[0]
           //Get the meta data of the folder
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
            
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div  class="play">
                            <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="65" height="65" fill="currentColor" viewBox="0 0 65 65">
                                <circle cx="32.5" cy="32.5" r="21.5" fill="#3be477"/>
                                <polygon points="28.5,23 28.5,42 43.5,32.5" fill="black"/>
                              </svg>                                                                                                        
                        </div>
                        <img src="/songs/${folder}/cover.jpeg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click", async item=>{
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0])
        })
    })
    
}

async function main() {
    // Get the list of all the songs
    await getSongs("songs/ncs");
    playMusic(songs[0],true)

    // Display all the albums on the page
    displayAlbums()

    
    //Attach an event listner to play , next and previous
    play.addEventListener("click",()=>{
        if (currentSong.paused){
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else{
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    // Listen for Timeupdate event
    currentSong.addEventListener("timeupdate", ()=>{
        document.querySelector(".songtime").innerHTML = `
        ${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}
        `
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // Add an event listner to seekbar
    document.querySelector(".seekbar").addEventListener("click",e=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration)*percent)/100
    })

    //Add an event listtner for hamburger
    document.querySelector(".hamburger").addEventListener("click",()=>{
        document.querySelector(".left").style.left = "0"
    })
    
    //Add an event listtner for close
    document.querySelector(".close").addEventListener("click",()=>{
        document.querySelector(".left").style.left = "-120%"
    })

    //Add an event listner to previous and next 
    previous.addEventListener("click",()=>{
        console.log("Previous Clicked")

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if((index-1) >=0){
            playMusic(songs[index-1])
        }
    })

    //Add an event listner to next 
    next.addEventListener("click",()=>{
        console.log("Next Clicked")

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if((index+1) < songs.length ){
            playMusic(songs[index+1])
        }
    })
    // Add an event to volume 
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e)=>{
        currentSong.volume = parseInt(e.target.value)/100
        if (currentSong.volume > 0){
            document.querySelector(".volume > img").src = document.querySelector(".volume > img").src.replace("mute.svg",  "volume.svg")
        } 
    })

    // Add event listner to mute the track
    document.querySelector(".volume > img").addEventListener("click" , e=>{
        console.log(e.target)
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg",  "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg",  "volume.svg")
            currentSong.volume = .1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })

    



    
    
}

main();
