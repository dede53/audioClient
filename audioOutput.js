var lame            = require('lame');
var Speaker         = require('speaker');
var volume          = require("pcm-volume");
var request         = require('request');

class audioOutput {
    constructor(settings){
        this.settings       = settings;
        this.isPlaying      = false;
        this.lastTitle      = "";
        this.volume         = new volume();
        this.info           = {};
    }
}

audioOutput.prototype.play = function(info){
    if(!info){
        return;
    }
    this.info = info;

    if(this.lastTitle == this.info.title){
        this.lameInstance.pipe(this.volume);
    }else{
        console.log("audioOutput.load");

        if(this.speaker instanceof Speaker){
            this.speaker.end();
            this.speaker.close();
            this.speaker = null;
        }

        this.lameInstance   = new lame.Decoder();
        request(this.info.url).pipe(this.lameInstance);
        this.lameInstance.on("format", data => {
            console.log("audioOutput.load.on.format");
            this.settings.sampleRate    = parseInt(data.sampleRate) || 48000;
            this.speaker                = new Speaker(this.settings);
            this.isPlaying              = true;
            this.lameInstance.pipe(this.volume).pipe(this.speaker);
        }); 
    }
};
audioOutput.prototype.pause = function(){
    if(this.isPlaying){
        console.log("audioOutput.pause");
        this.lameInstance.unpipe();
    }
};
audioOutput.prototype.setVolume = function(value){
    console.log("audioOutput.volume." + value);
    this.volume.setVolume(value);
};

audioOutput.prototype.getInfo = function(){
    return this.info;
}

exports = module.exports = audioOutput;