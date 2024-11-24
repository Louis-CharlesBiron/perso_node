const canvas = document.getElementById("canvas"), ctx = canvas.getContext("2d")
ctx.strokeWidth = 5

function resizeCanvas() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

window.addEventListener("resize", resizeCanvas)
resizeCanvas()

let isdrawing=false, lastX=null, lastY=null

canvas.onmousemove=e=>{
    if (isdrawing) {
        let x = e.clientX, y = e.clientY

        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(lastX||x, lastY||y)
        ctx.strokeStyle = "red"
        ctx.stroke()
    
        lastX=x
        lastY=y
    }
}

canvas.onmousedown=()=>{
  isdrawing = true
}

canvas.onmouseup=()=>{
  isdrawing = false
  lastX = lastY = null
}