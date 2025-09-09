require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const ejs = require("ejs");
const app = express();
const port = 5000;
const gameModule = require("./game")
const authMiddleware = require("./auth");

app.engine("html", ejs.renderFile);
app.set("view engine", "html");
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/', gameModule.router)

/* ENDPOINTS */

app.get("/", (req, res) => {
    if (req.cookies.name) {
        res.render("map.html");
    } 
    else {
        res.render("name.html");
    }
});

app.get('/admin', authMiddleware, function (req, res)
{
    res.render('admin.html');
});

app.listen(port, function () {
    console.log('Webserver läuft und hört auf Port %d', port);
});