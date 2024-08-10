'use strict'
let ws = new WebSocket("ws://" + (location.host||"10.0.0.67:3000"))

function send(obj) {
    ws.send(JSON.stringify(obj))
}

ws.onopen = () => {

    ws.onmessage = message => {
        let m = JSON.parse(message.data)
        console.log(m)
    }

} 