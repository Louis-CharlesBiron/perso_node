"use strict"
const webSocket = require("ws"),
    Client = require("./Client"),
    handle = require("./handles")

const PORT=3000, wss=new webSocket.Server({port:PORT}, ()=>console.log("Server running, (ws://localhost:"+PORT+")"))

let clients = []
wss.on("connection", (ws, req) => {
    let client = new Client(req.socket.remoteAddress, ws)
    clients.push(client)
    console.log("CONNECTION:", client.ip, client.id)

    ws.on("close", () => {
        console.log("DISCONNECT:", client.ip, client.id)
        clients = clients.filter(c => c.id !== client.id)
    })

    ws.on("message", message => {
        let m = JSON.parse(message.toString())
        //console.log(m)

        // handle commands
        handle(m)
    })
})

function sendAll(obj, wsList = clients) {
    wsList.forEach(c=>c.send(obj))
}