"use strict"
const express = require("express"), // npm install express
    fs = require("fs"),
    bodyParser = require("body-parser"),
    webSocket = require("ws"), // npm install ws
    Client = require('./Client')

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

// SERVER
const server = app.listen(3000, "0.0.0.0", () => console.log("server up")),
    wss = new webSocket.Server({ server })
    app.use(express.static(__dirname+"/public"))

// WEB SOCKET
let clients = []
wss.on("connection", (ws, req) => {
    let client = new Client(req.socket.remoteAddress, ws)
    clients.push(client)
    console.log("CONNECTION:", client.ip, client.id)


    ws.on("close", () => {
        console.log("DISCONNECT:", client.ip, client.id)
        clients = clients.filter(c=>c.id!==client.id)
    })

    ws.on("message", message => {
        let m = JSON.parse(message.toString())
        console.log(m)
    })

})

function sendAll(obj, wsList = clients) {
    wsList.forEach((c) => {
        c.send(obj)
    })
}
 