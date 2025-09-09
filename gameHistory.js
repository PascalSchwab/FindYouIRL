const fs = require("fs");
const FILE_NAME = "data.json";

class GameHistory{
    constructor(){
        this.currentGame = null;
        this.history = {}
    }

    save(){
        fs.writeFile(FILE_NAME, JSON.stringify(this), (err) => {
            if (err) {
                console.error("Error writing file:", err);
            } else {
                console.log("Game saved!");
            }
        });
    }

    static load(){
        let gameHistory = new GameHistory();
        try {
            const json = JSON.parse(fs.readFileSync(FILE_NAME, "utf8"));
            gameHistory.currentGame = json.currentGame;
            gameHistory.history = json.history;
            console.log("Game loaded!");
        } catch (err) {
            console.warn("No history file or invalid JSON, starting with empty object.");
        }
        return gameHistory;
    }
}

var gameHistory = GameHistory.load();

module.exports = {GameHistory, gameHistory}