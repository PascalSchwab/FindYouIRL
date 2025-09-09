const coord = [49.01525, 12.10175];
const map = L.map('map', {
    center: coord,
    zoom: 12,
    minZoom: 12,
    maxZoom: 18,
    maxBounds: [[48.81, 11.73], [49.21, 12.47]],
    maxBoundsViscosity: 0.8
});
var marker = null;
const popup = document.getElementById("popup");
const uuid = new URLSearchParams(window.location.search).get("id");
const timeContainer = document.getElementById("time");
let gameData = null;

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
map.on('click', onMapClicked);

startTimer();

/*
    Functions
*/

function onMapClicked(e) {
    var geojsonFeature = {
        "type": "Feature",
        "properties": {},
        "geometry": {
                "type": "Point",
                "coordinates": [e.latlng.lat, e.latlng.lng]
        }
    }

    if(marker != null) removeMarker();

    L.geoJson(geojsonFeature, {
        pointToLayer: function(feature, latlng){
            marker = L.marker(e.latlng, {
                title: "Your Guess",
                riseOnHover: true
            });

            return marker;
        }
    }).addTo(map);

    popup.classList.add("visible");
}

function removeMarker(){
    map.removeLayer(marker);
    popup.classList.remove("visible");
}

function sendGuess(){
    var xhr = new XMLHttpRequest();
    xhr.open("POST", window.location.origin + "/game/guess?id=" + uuid, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.responseType = "json"
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 201) {
                console.log("Server response:", xhr.response);
            } 
            else {
                console.error("Error:", xhr.status, xhr.statusText);
            }
        }
    };
    xhr.send(JSON.stringify({
        lat: marker.getLatLng().lat,
        lng: marker.getLatLng().lng
    }));
}

async function startTimer(){
    gameData = await getGameData();
    let remaining = (gameData.duration - (Date.now() - gameData.time)) / 1000
    const timerId = setInterval(update, 1000);
    function update() {
        let minutes = Math.floor(remaining / 60);
        let seconds = ((remaining % 60)).toFixed(0);
        timeContainer.innerText = minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
        if (remaining > 0) {
            remaining--;
        } else {
            clearInterval(timerId);
            timeContainer.innerText = "Spiel beendet!";
        }
    }
}

function getGameData() {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", window.location.origin + "/game/info/time?id=" + uuid, true);
        xhr.responseType = "json";
        xhr.onload = function() {
            if (xhr.status === 200) {
                resolve(xhr.response);
            } else {
                reject(new Error("Error: " + xhr.status));
            }
        };
        xhr.onerror = function() {
            reject(new Error("Network error"));
        };
        xhr.send();
    });
}

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}