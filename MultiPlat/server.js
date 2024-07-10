"use strict";
const express = require("express"),
    fs = require("fs"),
    bodyParser = require("body-parser"),
    webSocket = require("ws"),
    Player = require("./model/Player.js")

const app = express()
app.use(bodyParser.json())

// ctx
let objects = []


// REQUESTS
app.get("/", (req, res) => {
    fs.readFile(__dirname+"/public/index.html", "utf8", (err, data) => 
        res.send(
	        data.replaceAll("{{IP}}", req.ip)
        )
    )
})

app.post("/template", (req, res) => {
    console.log(req.body.value)
})

// SERVER
const server = app.listen(3000, "0.0.0.0", () => console.log("server up")),
    wss = new webSocket.Server({ server })
    app.use(express.static(__dirname+"/public"))

// WEB SOCKET
wss.on("connection", (ws, req) => {
    let player = createPlayer(req.socket.remoteAddress, ws)
    objects.push(player)


    console.log("CONNECTION: " + player.ip)//
    wsSendAll({t:"d", o:objects})//

    ws.on("close", () => {
        console.log("DISCONNECT: " + player.ip)
        objects = objects.filter(p => p.id !== player.id)
    })

    ws.on("message", message => {
        let m = JSON.parse(message.toString())
        if (m.t !== "update") console.log(m)

        if (m.t == "update") {
            player.update(m.v)
            wsSendAll({t:"d", o:objects})
        }
        else if (m.t == "getSelf") player.send({t:"self", v:player})
    })
})


function wsSendAll(obj) {
    wss.clients.forEach((c) => {
        c.send(JSON.stringify(obj))
    })
}
function wsSend(ws, obj) {
    ws.send(JSON.stringify(obj))
}

function createPlayer(ip, ws) {
    let p = new Player(ip, ws, "player", 50, 50, 10, 10, "aliceblue", 1)
    p.send({t:"auth", v:p})
    return p
}



// GAME

//let isLoop = false, fps = 1000/60
//
//function loop() {
//    wsSendAll({t:"d", o:objects})
//    if (isLoop) setTimeout(loop, fps)
//}
//
//function start() {
//    if (!isLoop) {
//        isLoop = true
//        loop()
//    }
//}start()
//
//function stop() {
//    isLoop = false
//}