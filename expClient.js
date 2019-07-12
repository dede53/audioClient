var settings        = require("./settings.json");
var audioOutput     = require("./audioOutput.js");
var dgram           = require('dgram');
var express         = require("express");
var server          = require("http").Server(app);
var io              = require("socket.io")(server);
var client          = dgram.createSocket({ type: "udp4", reuseAddr: true });
var app             = express();
var DEVMODE         = false;
var PORT            = 41848;
var SERVERPORT      = 41849;
var MCAST_ADDR      = "233.255.255.255"; //same mcast address as Server
var id              = Math.random();
var audio           = new audioOutput(settings.speakerConfig || {});

io.on('connection', function(socket) {
    console.log("io.connected");
    socket.on("play", (data) => {
        console.log("io.on.play");
        audio.play(data);
    });
    socket.on("skipTo", data => {
        console.log("io.on.skipTo");
        audio.play(data);
    });
    socket.on("pause", () => {
        console.log("io.on.pause");
        audio.pause();
    });
    socket.on("volume", value => {
        console.log("io.on.volume");
        audio.setVolume(value);
    });
    socket.on('disconnect', function(reason) {
        console.log("io.on.disconnect");
        audio.pause();
    });
});


app.get("/player/:command", (req, res) => {
    res.sendStatus(audio.getInfo());
});

if(!DEVMODE){
    server.listen(SERVERPORT);
}


client.on('listening', function () {
    var address = client.address();
    console.log('UDP Client listening on ' + settings.localIp + ":" + address.port);
    client.setBroadcast(true)
    client.setMulticastTTL(128); 
    client.addMembership(MCAST_ADDR);
});

client.on('message', function (message, remote) {
    message = message.toString();
    if(message == "search audioGateway"){
        var address = client.address();
        // for development:
        if(DEVMODE){
            address.address += id; 
        }
        var res = "audioGateway:" + settings.localIp + ":" + SERVERPORT + ":" +  settings.place;
        client.send(res, PORT, MCAST_ADDR, (e) => {
            if(e){
                console.log(e);
            }
        });
    }
});

client.bind(PORT);
