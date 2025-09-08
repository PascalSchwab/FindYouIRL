const form = document.getElementById("startGame");
const urlContainer = document.getElementById("url-container");
const urlText = document.getElementById("url");

form.addEventListener("submit", async function(event) {
    event.preventDefault();
    try {
        const duration = form.duration.value;
        const pw = new URLSearchParams(window.location.search).get("pw");
        const position = await getCurrentPosition();

        var xhr = new XMLHttpRequest();
        xhr.open("POST", window.location.origin + "/game", true);
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
            pw: pw
        }));
    } catch (err) {
        console.error("Error:", err);
    }
});

function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            position => resolve(position),
            err => reject(err)
        );
    });
}

function copy(){
    navigator.clipboard.writeText(urlText.innerText);
}