const express = require("express");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const ejs = require("ejs");
const uuid = require("uuid");
const app = express();
const port = 5000;

app.engine("html", ejs.renderFile);
app.set("view engine", "html");
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/*
    Variables
*/

let gameHistory = loadHistory();

/*
    Endpoints
*/

app.post('/guess', (req, res) => {
    let coord = getCoordsFromBody(req.body);
    let id = req.body.id;
    let name = req.body.name;
    let ip = req.socket.remoteAddress;
    let game = gameHistory[id];
    let currentTime = Date.now();
    if(game && game.guesses[ip] == null && (currentTime - game.time) < game.duration){
        game.guesses[ip] = new Guess(coord, name, ip);
        saveHistory();
        res.json({lat: game.coord[0], lng: game.coord[1], distance: getDistance(game.coord, coord)})
    }
    else{
        res.sendStatus(400);
    }
});

app.get('/game', (req, res) => {
    let game = gameHistory[req.query.id];
    game ? res.json({id: game.id, time: game.time, duration: game.duration}) : res.sendStatus(400);
});

app.post('/game', (req, res) => {
    if(req.body.pw == process.env.ADMIN_PW){
        let duration = req.body.duration*60*1000
        let game = new Game(getCoordsFromBody(req.body), duration)
        gameHistory[game.id] = game;
        saveHistory()
        // TODO: Send message to chat
        res.json({url: req.protocol + '://' + req.get('host') + "/?id=" + game.id});
    }
    else{
        res.sendStatus(401);
    }
});

app.get('/admin', function (req, res)
{
    if(req.query.pw == process.env.ADMIN_PW){
        res.render('admin.html');
    }
    else{
        res.render('401.html');
    }
});

app.get("/", (req, res) => {
    if(!req.query.id){
        res.render("401.html");
    }
    else if (req.cookies && req.cookies.name) {
        res.render("index.html");
    } 
    else {
        res.render("name.html");
    }
});

app.listen(port, function () {
    console.log('Webserver läuft und hört auf Port %d', port);
});

/*
    Functions
*/

function getCoordsFromBody(body){
    return [body.lat, body.lng];
}

function saveHistory(){
    fs.writeFile("history.json", JSON.stringify(gameHistory), (err) => {
        if (err) {
            console.error("Error writing file:", err);
        } else {
            console.log("Game saved!");
        }
    });
}

function loadHistory(){
    try {
        const data = fs.readFileSync("history.json", "utf8");
        console.log("Game loaded!");
        return JSON.parse(data);
    } catch (err) {
        console.warn("No history file or invalid JSON, starting with empty object.");
        return {};
    }
}

// Distance in meters
function getDistance(coord1, coord2) {
    const [lat1, lon1] = coord1;
    const [lat2, lon2] = coord2;

    const R = 6371e3;
    const toRad = deg => deg * Math.PI / 180;

    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);

    const a = Math.sin(Δφ / 2) ** 2 +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * c;
    return d;
}

/*
    Classes
*/

class Game{
    constructor(coord, duration){
        this.id = uuid.v4();
        this.coord = coord;
        this.time = Date.now();
        this.guesses = {}
        this.duration = duration
    }
}

class Guess{
    constructor(coord, name, ip){
        this.coord = coord;
        this.name = name;
        this.ip = ip;
    }
}