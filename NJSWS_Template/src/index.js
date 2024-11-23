const ws = new WebSocket("ws://localhost:3000")

function send(obj) {
    ws.send(JSON.stringify(obj))
}

ws.onopen=()=>{
    ws.onmessage=message=>{
        let m = JSON.parse(message.data)
        console.log(m)
    }
} 

console.log("Hi")
