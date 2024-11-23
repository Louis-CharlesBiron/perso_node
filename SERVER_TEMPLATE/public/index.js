const ws = new WebSocket("wss://"+location.host)

function send(obj) {
    ws.send(JSON.stringify(obj))
}

ws.onopen=()=>{
    ws.onmessage=message=>{
        let m = JSON.parse(message.data)
        console.log(m)
    }
} 