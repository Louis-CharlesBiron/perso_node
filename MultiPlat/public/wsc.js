'use strict'
const ws = new WebSocket("ws://" + location.host)
function send(obj) {
    if (ws.readyState == 1 || ws.readyState == 2) ws.send(JSON.stringify(obj))
}

ws.onmessage = message => {
    let m = JSON.parse(message.data)
    if (m.t !== "d") console.log(m)

    if (m.t == "d") draw(m.o)
    else if (m.t == "auth") {// set player
        player = m.v
        start()
    }
}








