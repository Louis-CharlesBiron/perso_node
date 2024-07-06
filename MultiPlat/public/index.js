'use strict'
const ws = new WebSocket("ws://" + location.host)
function send(obj) {
    ws.send(JSON.stringify(obj))
}

ws.onmessage = message => {
    let m = JSON.parse(message.data)
    console.log(m.data)
    if (m.type == "") {

    }
}






