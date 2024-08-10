"use strict";
const express = require("express"),
    fs = require("fs"),
    bodyParser = require("body-parser"),
    webSocket = require("ws")

const app = express()
app.use(bodyParser.json())

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
let idGiver = 0
wss.on("connection", (ws, req) => {
    let ip = req.socket.remoteAddress
    ws.info = { id: idGiver++, ip: ip }

    console.log("CONNECTION: " + ip)

    ws.on("close", () => {
        console.log("DISCONNECT: " + ip)
    })

    ws.on("message", m => {
        console.log(m.toString())
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