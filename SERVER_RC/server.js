"use strict";
const express = require("express"),
    fs = require("fs"),
    bodyParser = require("body-parser"),
    webSocket = require("ws"),
    Client = require('./Client');

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


    ws.on("close", () => {
        console.log("DISCONNECT:", client.ip, client.id, client.auth)
        clients = clients.filter(c=>c.id!==client.id)
        if (client.auth == "client") updateAU()
    })

    ws.on("message", message => {
        let m = JSON.parse(message.toString())
        if (m.type == "auth") {
            client.auth = m.value
            updateAU()
            console.log("CONNECTION:", client.ip, client.id, client.auth)
        }
        else if (m.type == "getClients") client.send({ type: "getClients", value: clients.map(c=>c.getSelf()) })
        else if (m.type == "command") commandManager(m)
        else if (m.type == "response") responseManager(m)
    })

})


function sendAll(obj, wsList = clients) {
    if (wsList == "client" || wsList == "console") wsList = clients.filter(x => x.auth == wsList)

    wsList.forEach((c) => {
        c.send(obj)
    })
}

function updateAU() {
    sendAll({ type: "activeUsers", value: clients.map(c => c.getSelf()) }, "console")
}

//COMMANDS
function commandManager(m) {
    let c = m.command, v = m.value, t = clients.filter(x=>m.targets?.map(x=>""+x).includes(""+x.id))

    //custom targets
    if (c == "test") t = "client"

    sendAll({type:"command", command:c, value:v, responseTarget: m.responseTarget}, t)
}

//RESPONSES
function responseManager(m) {
    let c = m.command, v = m.value, rt = clients.filter(x => m.responseTarget?.map(x => "" + x).includes("" + x.id))


    sendAll(m, rt)
}