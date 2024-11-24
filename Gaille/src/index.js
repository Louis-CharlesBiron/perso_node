const fpsCounter = new FPSCounter(), CVS = new Canvas(canvas)

// DECLARE OBJS


let mouseup = false, adotShapeAnim,
adotShape = new Shape([10,10],[new Dot([30,30])], null, null, null, (ctx, dot, ratio, m, dist)=>{
  dot.radius = mod(DEFAULT_RADIUS*2, ratio, DEFAULT_RADIUS*2*0.5)
  _drawOuterRing(dot, [255,255,255,mod(0.3, ratio)], 3)
  // drag
  if (m.clicked && dist < 50) {
      mouseup = true
      if (dot?.currentAnim?.id == adotShapeAnim?.id && adotShapeAnim) adotShapeAnim.end()
      dot.x = m.x
      dot.y = m.y
  } else if (mouseup) {
      mouseup = false
      adotShapeAnim = dot.addForce(Math.min(mod(m.speed, ratio)/4, 300), m.dir, 750+ratio*1200, Anim.easeOutQuad)
  }
})


let mouseup2 = false, adotShapeAnim2,
adotShape2 = new Shape([50,50],[new Dot([150,50])], 50, [0,0,200,1], null, (ctx, dot, ratio, m, dist)=>{
  dot.radius = mod(50*2, ratio, 50*2*0.5)
  // drag
  if (m.clicked && dist < 50) {
      mouseup2 = true
      if (dot?.currentAnim?.id == adotShapeAnim2?.id && adotShapeAnim2) adotShapeAnim2.end()
      dot.x = m.x
      dot.y = m.y
  } else if (mouseup2) {
      mouseup2 = false
      adotShapeAnim2 = dot.addForce(Math.min(mod(m.speed, ratio)/4, 300), m.dir, 750+ratio*1200, Anim.easeOutQuad)
  }
})

let le = new Grid("hi ", [5, 20], 50, null, [100,200], 2, null, null, (ctx, dot, ratio, m, dist)=>{
  dot.radius = mod(DEFAULT_RADIUS, ratio, DEFAULT_RADIUS)
  if (dist < 200) _drawConnections(dot, [dot.r,dot.g,dot.b,mod(0.5, ratio)], dot.ratioPos)
  
 _drawDotConnections(dot, [255,0,0,1])
}, ()=>adotShape2.dots[0].pos)


CVS.add(adotShape.asSource())
CVS.add(adotShape2.asSource())
CVS.add(le.asSource())

// USER ACTIONS
CVS.setmousemove()
CVS.setmouseleave()
CVS.setmousedown()
CVS.setmouseup()

// START
CVS.startLoop()


let padding = [20, 5]
Neutralino.computer.getDisplays().then(ds=>{
  let dims = ds.reduce((a,b)=>{
    a.width+=b.resolution.width
    a.height = a.height > b.resolution.height ? a.height : b.resolution.height
    return a
  },{width:0,height:0})

  console.log(dims)
  Neutralino.window.move(-padding[0]/2,-padding[1])
  Neutralino.window.setSize({width:dims.width+padding[0], height:dims.height+padding[1]})
})