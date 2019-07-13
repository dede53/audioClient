# AudioClient

A streamingClient build in nodejs for sharing Musik in an easy way.

```
{
    "speakerConfig": {
        "device":       "hw:1,0"
    },
    "localIp":  "192.168.2.62",
    "name":     "Livingroom"
}
```
In the ```speakerConfig``` you can place all you options for the speaker.
Look here for more Informations: https://github.com/TooTallNate/node-speaker

# Installation
```
git clone https://github.com/dede53/audioClient
cd audioClient
npm install
```

# How to start:
```
node index.js
```
or with
```
node daemon.js start
```
