// CONFIG //
window.requestAnimationFrame = window.requestAnimationFrame ||
                               window.mozRequestAnimationFrame ||
                               window.webkitRequestAnimationFrame ||             
                               window.msRequestAnimationFrame;

let ctx = cvs.getContext("2d", {})
ctx.imageSmoothingEnabled = false
ctx.lineWidth = 3
ctx.fillStyle = ctx.stokeStyle = "aliceblue"

function updateCvsSize(fw, fh) {
    cvs.width = fw??window.innerWidth-20
    cvs.height = fh??cvs.width/2
}updateCvsSize(500, 500)



// DRAW //
let t=[], fps, avgFps

function draw(objs) {
    // clear
    ctx.clearRect(0, 0, cvs.width, cvs.height) 

    //draw
    objs.forEach(obj=>{
        ctx.fillStyle = obj.c
        ctx.fillRect(obj.x, obj.y, obj.w, obj.h)
    })

    //not my script
    let n=performance.now();while(t.length>0&&t[0]<=n-1000){t.shift()};t.push(n);fpsDisplay.textContent=(fps=t.length)+" fps";if (!avgFps) {avgFps=60;setTimeout(()=>{avgFps=fps-1},1000)}
    
}




// PLAYER //
let player, // will be set in wsc.js
    isLoop = false, tpps = 1000/60
    keybinds = {
        up:["w", "arrowup"],
        down:["s", "arrowdown"],
        right:["d", "arrowright"],
        left:["a", "arrowleft"]
    }, 
    activeKeys = {
        up:false,
        down:false,
        right:false,
        left:false
    }

let tt=[], pps, avgPps// PPS VARS (not my script)
    

// physics loop
function playerloop() {
    let s = player.s

    if (activeKeys.up) player.y-=s
    if (activeKeys.down) player.y+=s
    if (activeKeys.right) player.x+=s
    if (activeKeys.left) player.x-=s

    if (Object.values(activeKeys).some(x=>x)) send({t:"update", v:{x:player.x, y:player.y, w:player.w, h:player.h, c:player.c, s:player.s}}) //all attrs


    //PPS (not my script)
    let n=performance.now();while(tt.length>0&&tt[0]<=n-1000){tt.shift()};tt.push(n);ppsDisplay.textContent=(pps=tt.length)+" pps";if (!avgPps) {avgPps=60;setTimeout(()=>{avgPps=pps-1},1000)}

    if (isLoop) setTimeout(playerloop, tpps)
}
function start() {
    if (!isLoop) {
        isLoop = true
        playerloop()
    }
}

//keys
document.onkeydown=document.onkeyup=e=>{
    let k = e.key.toLowerCase(), isKeyDown = (e.type == "keydown")
        if (!e.ctrlKey) e.preventDefault()

        if (keybinds.up.includes(k)) activeKeys.up = isKeyDown
        if (keybinds.down.includes(k)) activeKeys.down = isKeyDown
        if (keybinds.right.includes(k)) activeKeys.right = isKeyDown
        if (keybinds.left.includes(k)) activeKeys.left = isKeyDown
}

document.onblur=() => {
    activeKeys.up = activeKeys.down = activeKeys.right = activeKeys.left = false
}

btnUP.onmousedown=btnUP.onmouseup = btnDOWN.onmousedown=btnDOWN.onmouseup = btnRIGHT.onmousedown=btnRIGHT.onmouseup = btnLEFT.onmousedown=btnLEFT.onmouseup = e => {
    let isDown = (e.type == "mousedown"), k = e.target.textContent.toLowerCase()
    activeKeys[k] = isDown
}
