const router = require('express').Router()
const authMiddleware = require("./auth");
const twitch = require("./twitch");
const gameHistory = require("./gameHistory").gameHistory;
const globe = require("./globe");

/* ENDPOINTS */

router.post("/game/create", authMiddleware, (req, res) => {
    let duration = req.body.duration*60*1000;
    let coord = {lat: req.body.lat, lng: req.body.lng};
    let game = new Game(coord, duration);
    gameHistory.currentGame = game.id;
    gameHistory.history[game.id] = game;
    gameHistory.save();
    let url = req.protocol + '://' + req.get('host') + "/?id=" + game.id;
    process.env.CHANNEL_LIST.split(",").forEach((channel)=>{
        twitch.say(channel, url);
    });
    res.json({url: url});
});

router.get("/game/info/time", checkIdMiddleware, (req, res) => {
    let game = gameHistory.history[req.query.id];
    res.json({id: game.id, time: game.time, duration: game.duration});
});

router.get("/game/info/scoreboard", authMiddleware, (req, res) => {
    let game = gameHistory.history[gameHistory.currentGame];
    if(!game) return res.sendStatus(204);
    let sortedGuesses = Object.values(game.guesses).sort((a, b) => a.distance - b.distance).map(g => ({ name: g.name, distance: g.distance }));
    res.json({scoreboard: sortedGuesses});
});

router.post("/game/guess", checkIdMiddleware, checkIPv4Middleware, checkTimeMiddleware, (req, res) => {
    let game = gameHistory.history[req.query.id];
    let coord = {lat: req.body.lat, lng: req.body.lng};
    let name = req.cookies.name;
    let ip = req.socket.remoteAddress;
    let distance = globe.getDistance(game.coord, coord);
    game.guesses[ip] = new Guess(coord, name, ip, distance);
    gameHistory.save();
    res.json({lat: game.coord.lat, lng: game.coord.lng, distance: distance});
});

/* MIDDLEWARE */

function checkIdMiddleware(req, res, next){
    let id = req.query.id;
    if(id && gameHistory.currentGame === id) return next();
    return res.sendStatus(400);
}

function checkIPv4Middleware(req, res, next){
    let game = gameHistory.history[req.query.id];
    let ip = req.socket.remoteAddress;
    if(game.guesses[ip] == null) return next();
    return res.sendStatus(400);
}

function checkTimeMiddleware(req, res, next){
    let game = gameHistory.history[req.query.id];
    if((Date.now() - game.time) < game.duration) return next();
    return res.sendStatus(400);
}

/* CLASSES */

class Game{
    constructor(coord, duration){
        this.id = require("uuid").v4();
        this.coord = coord;
        this.time = Date.now();
        this.guesses = {}
        this.duration = duration
    }
}

class Guess{
    constructor(coord, name, ip, distance){
        this.coord = coord;
        this.name = name;
        this.ip = ip;
        this.distance = distance
    }
}

module.exports = { Game, Guess, router };