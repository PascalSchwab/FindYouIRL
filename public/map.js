const coord = [49.01525, 12.10175];
const map = L.map('map', {
    center: coord,
    zoom: 12,
    minZoom: 12,
    maxZoom: 18,
    maxBounds: [[48.81, 11.73], [49.21, 12.47]],
    maxBoundsViscosity: 0.8
});
const MarkerIcon = L.Icon.extend({
    options: {
        iconSize:     [41, 41],
        iconAnchor:   [20.5, 41]
    }
});
var redMarkerIcon = new MarkerIcon({iconUrl: 'images/red-marker.png'});
var marker = null;
const popup = document.getElementById("popup");
const uuid = new URLSearchParams(window.location.search).get("id");
const timeContainer = document.getElementById("time");
let timer = null;
let gameData = null;

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
map.on('click', onMapClicked);

startTimer();

/*
    Functions
*/

function onMapClicked(e) {
    if(gameData.guessed) return;
    let geojsonFeature = {
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
    postRequest(window.location.origin + "/game/guess?id=" + uuid, {
        lat: marker.getLatLng().lat,
        lng: marker.getLatLng().lng
    }).then((response)=>{
        if(response.status === 200){
            setMarker(response.data.lat, response.data.lng, "Our position", redMarkerIcon);
            L.polyline([{lat: response.data.lat, lng: response.data.lng}, marker.getLatLng()], {
                color: '#9e2020ff',
                weight: 4,
                opacity: 0.95,
                dashArray: '0'
            }).addTo(map);
            gameData.guessed = true;
            popup.classList.remove("visible");
            clearInterval(timer);
            timeContainer.innerText = "Distance: " + Math.round(response.data.distance) + "m";
        }
    });
}

async function startTimer(){
    gameData = await getRequest(window.location.origin + "/game/info?id=" + uuid).then((response)=>{
        if(response.status === 200){
            return response.data;
        }
    });
    if(gameData == null) return;
    if(gameData.guessed){
        timeContainer.innerText = "Distance: " + Math.round(gameData.distance) + "m";
        setMarker(gameData.guess.lat, gameData.guess.lng, "Your Guess");
        setMarker(gameData.target.lat, gameData.target.lng, "Our position", redMarkerIcon);
        L.polyline([{lat: gameData.guess.lat, lng: gameData.guess.lng}, {lat: gameData.target.lat, lng: gameData.target.lng}], {
            color: '#9e2020ff',
            weight: 4,
            opacity: 0.95,
            dashArray: '0'
        }).addTo(map);
        return;
    }
    let remaining = (gameData.duration - (Date.now() - gameData.time)) / 1000
    timer = setInterval(update, 1000);
    function update() {
        let minutes = Math.floor(remaining / 60);
        let seconds = ((remaining % 60)).toFixed(0);
        timeContainer.innerText = minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
        if (remaining > 0) {
            remaining--;
        } else {
            clearInterval(timer);
            timeContainer.innerText = "Game over!";
        }
    }
}

function setMarker(lat, lng, text, icon){
    let geojsonFeature = {
        "type": "Feature",
        "properties": {},
        "geometry": {
                "type": "Point",
                "coordinates": [lat, lng]
        }
    }

    L.geoJson(geojsonFeature, {
        pointToLayer: () => {
            return L.marker({lat:lat, lng:lng}, {
                title: text,
                riseOnHover: true,
                icon: icon ?? new L.Icon.Default()
            });
        }
    }).addTo(map);
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