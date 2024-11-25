const fpsCounter = new FPSCounter(), CVS = new Canvas(canvas, ()=>fpsDisplay.textContent=fpsCounter.getFps())

let padding = [20, 50]
Neutralino.computer.getDisplays().then(ds=>{
  let dims = ds.reduce((a,b)=>(a.width+=b.resolution.width,a.height=a.height>b.resolution.height?a.height:b.resolution.height,a),{width:0,height:0}),
  w = dims.width+padding[0], h = dims.height+padding[1]
  Neutralino.window.move(-10,-38)
  console.log(w, h)
  Neutralino.window.setSize({width:w, height:h})

  // DRAWINGS
  let blankRad=300, blankVar=410,
      clearRad=50, clearVar=65
  for (let i=0;i<w;i+=blankRad*0.3) CVS.add(createBlank(blankRad, blankVar, [i, h/3], h).asSource())

  for (let i=0;i<w;i+=clearRad*5) CVS.add(createClear(clearRad, clearVar, [i, h/2], h/2).asSource())


  let le = new Grid("this is not a virus i think", [5, 20], 50, null, [100,200], 2, null, null, (ctx, dot, ratio, m, dist)=>{
    dot.radius = mod(DEFAULT_RADIUS, ratio, DEFAULT_RADIUS)
    if (dist < 200) _drawConnections(dot, [dot.r,dot.g,dot.b,mod(0.5, ratio)], dot.ratioPos)
  _drawDotConnections(dot, [255,0,0,1])
  }, null)
  CVS.add(le.asSource())

  // USER ACTIONS
  CVS.setmousemove()
  CVS.setmouseleave()
  CVS.setmousedown()
  CVS.setmouseup()

  // START
  CVS.startLoop()
})

// DECLARE OBJS
function createBlank(radius, radVariation=0, pos=[0,0], Yvariation=0) {
  return new Shape([0,0], [new Dot([pos[0],pos[1]+random(-Yvariation,Yvariation)])], Math.abs(radius+random(-radVariation, radVariation)), [0,0,0,1], 1000, (ctx, dot, ratio, m, dist)=>{
    let r = dot.parent.radius
    dot.radius = mod(r, ratio, r*0.1)*2
  })
}

function createClear(radius, radVariation=0, pos=[0,0], Yvariation=0) {
  let mouseup = false, adotShapeAnim, retShape = new Shape([0,0],[new Dot([pos[0],pos[1]+random(-Yvariation,Yvariation)])], Math.abs(radius+random(-radVariation, radVariation)), [0,0,0,1], Math.abs(radius+random(radVariation/4, radVariation)), (ctx, dot, ratio, m, dist)=>{
    let r = dot.parent.radius, cr = mod(r*2, ratio, r*2*0.2)
    ctx.globalCompositeOperation = "destination-out"
    ctx.beginPath()
    ctx.arc(dot.x, dot.y, cr, 0, Math.PI*2)
    ctx.fill()
    ctx.globalCompositeOperation = "source-over"
  
    // drag
    if (m.clicked && dist < 50) {
        mouseup = true
        if (dot?.currentAnim?.id == adotShapeAnim?.id && adotShapeAnim) adotShapeAnim.end()
        dot.x = m.x
        dot.y = m.y
    } else if (mouseup) {
        mouseup = false
        adotShapeAnim = dot.addForce(Math.min(mod(m.speed, ratio)/1.8, 600), m.dir, 750+ratio*1200, Anim.easeOutQuad)
    }
  })
  return retShape
}


