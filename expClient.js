var lame            = require('lame');
var Speaker         = require('speaker');
var speaker         = new Speaker();
var lameInstance    = new lame.Decoder();
var request         = require('request');
var client          = dgram.createSocket({ type: "udp4", reuseAddr: true });
var express         = require("express");
var app             = express();
var server          = require("http").Server(app);
var io              = require("socket.io")(server);
var DEVMODE         = false;
var PORT            = 41848;
var MCAST_ADDR      = "233.255.255.255"; //same mcast address as Server
var place           = "Livingroom";
var dgram           = require('dgram');
var id              = Math.random();
var audio;
var lastTitle         = "";

io.on('connection', function(socket) {
    console.log("connected");
    socket.on("play", (data) => {
        if(data.title != lastTitle){
            console.log("play.restart");
            lastTitle       = data.title;
            audio           = undefined;
            speaker         = new Speaker();
            lameInstance    = new lame.Decoder();
            audio           = request(data.url);
            audio.pipe(lameInstance).pipe(speaker);
        }else{
            console.log("play.continue");
            lameInstance.pipe(speaker);
        }
    });
    socket.on("skipTo", data => {
        console.log("skipTo");
        lastTitle       = data.title;
        audio           = undefined;
        speaker         = new Speaker();
        lameInstance    = new lame.Decoder();
        audio           = request(data.url);
        audio.pipe(lameInstance).pipe(speaker);
    });
    socket.on("pause", () => {
        console.log("pause");
        lameInstance.unpipe(speaker);
    });
    socket.on("stop", () => {
        console.log("stop");
        audio = undefined;
        speaker = new Speaker();
        lameInstance = new lame.Decoder();
    });
    socket.on('disconnect', function(reason) {
        console.log("disconnect");
        lameInstance.unpipe(speaker);
        audio = undefined;
        lastTitle = undefined;
        speaker = new Speaker();
        lameInstance = new lame.Decoder();
    });
});


app.get("/player/:command", (req, res) => {
    res.sendStatus(200);
    switch(req.params.command){
        case "play":
            if(audio == null){
                audio = request('http://127.0.0.1:3000/');
                audio.pipe(lameInstance).pipe(speaker);
            }else{
                lameInstance.pipe(speaker);
            }
            break;
        default:
            lameInstance.unpipe(speaker);
            break;
    }
    
});

if(!DEVMODE){
    server.listen(2000);
}


client.on('listening', function () {
    var address = client.address();
    console.log('UDP Client listening on ' + address.address + ":" + address.port);
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
        var res = "audioGateway:" + address.address + ":" + address.port + ":" +  place;
        client.send(res, PORT, MCAST_ADDR, (e) => {
            if(e){
                console.log(e);
            }
        });
    }
});

client.bind(PORT);