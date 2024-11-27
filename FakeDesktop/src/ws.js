const ws = new WebSocket("ws://localhost:3000"), backlog = []

function send(obj) {
    if (ws.readyState == 1) ws.send(JSON.stringify(obj))
    else if (!ws.readyState) backlog.push(obj)
}

ws.onopen=()=>{
    ws.onmessage=message=>{
        let m = JSON.parse(message.data)
        console.log(m)
    }

    backlog.forEach(send)
}

