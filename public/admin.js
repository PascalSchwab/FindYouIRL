const form = document.getElementById("startGame");
const urlContainer = document.getElementById("url-container");
const urlText = document.getElementById("url");
const password = new URLSearchParams(window.location.search).get("password");

updateList();

form.addEventListener("submit", async function(event) {
    event.preventDefault();
    const duration = form.duration.value;
    // const image = form.image.files[0];
    const position = await getCurrentPosition();
    postRequest(window.location.origin + "/game/create?password=" + password, {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        duration: duration
    }).then((response)=>{
        if(response.status === 200){
            urlText.innerText=response.data.url;
            urlContainer.classList.add("visible");
        }
    });
});

function copy(){
    navigator.clipboard.writeText(urlText.innerText);
}

function updateList(){
    getRequest(window.location.origin + "/game/info/scoreboard?password=" + password)
    .then((response)=>{
        if(response.status === 200){
            changeScoreboardList(response.data.scoreboard);
        }
    });
}

function changeScoreboardList(scoreboard){
    let content = '<ol>';
    scoreboard.forEach((player) => {
        content += '<li>' + player.name + " | " + Math.round(player.distance) + '</li>'
    });
    content += '</ol>';
    document.getElementById("scoreboard").innerHTML = content;
}