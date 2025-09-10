const opts = {
    identity: {
        username: process.env.CHANNEL_NAME,
        password: "oauth:" + process.env.ACCESS_TOKEN
    },
    channels: [process.env.CHANNEL_NAME]
};

const client = new require("tmi.js").Client(opts);
client.connect().catch(console.error);

client.on("connected", (addr, port) => {
    console.log("Connected to Twitch!");
});

module.exports = client;