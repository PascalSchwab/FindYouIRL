const form = document.getElementById("startGame");
const urlContainer = document.getElementById("url-container");
const urlText = document.getElementById("url");
const password = new URLSearchParams(window.location.search).get("password");

updateList();

form.addEventListener("submit", async function(event) {
    event.preventDefault();
    try {
        const duration = form.duration.value;
        // TODO: Read file, save
        //const image = form.image.files[0];
        const position = await getCurrentPosition();

        var xhr = new XMLHttpRequest();
        xhr.open("POST", window.location.origin + "/game/create?password=" + password, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.responseType = "json"
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200 || xhr.status === 201) {
                    urlText.innerText=xhr.response.url;
                    urlContainer.classList.add("visible");
                } 
                else {
                    console.error("Error:", xhr.status, xhr.statusText);
                }
            }
        };
        xhr.send(JSON.stringify({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            duration: duration,
            image: image
        }));
    } catch (err) {
        console.error("Error:", err);
    }
});

function copy(){
    navigator.clipboard.writeText(urlText.innerText);
}

function updateList(){
    var xhr = new XMLHttpRequest();
    xhr.open("GET", window.location.origin + "/game/info/scoreboard?password=" + password, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.responseType = "json"
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 201) {
                changeScoreboardList(xhr.response.scoreboard);
            } 
            else {
                console.error("Error:", xhr.status, xhr.statusText);
            }
        }
    };
    xhr.send();
}

function changeScoreboardList(scoreboard){
    let content = '<ol>';
    scoreboard.forEach((player) => {
        content += '<li>' + player.name + " | " + Math.round(player.distance) + '</li>'
    });
    content += '</ol>';
    document.getElementById("scoreboard").innerHTML = content;
}