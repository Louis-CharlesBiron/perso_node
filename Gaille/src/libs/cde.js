// JS
// Canvas Dot Effects by Louis-Charles Biron
// Please don't use or credit this code as your own.
//

class Shape {
    constructor(pos, dots, radius, rgba, limit, drawEffectCB, ratioPosCB, setupCB, fragile) {
        this._cvs
        this._id = idGiver++
        this._initPos = pos || [0,0]            // initial shape center pos declaration / setup
        this._pos = this._initPos               // current shape center pos
        this._radius = radius??DEFAULT_RADIUS   // dots' radius
        this._rgba = rgba||DEFAULT_RGBA         // dots' rgba
        this._limit = limit||100                // dots' limit
        this._initDots = dots                   // initial dots declaration
        this._dots = []                         // current dots
        this._ratioPos = [Infinity,Infinity]    // position of ratio target object 
        this._drawEffectCB = drawEffectCB       // (ctx, Dot, ratio, mouse, distance, rawRatio)=>
        this._ratioPosCB = ratioPosCB           // custom ratio pos target (Shape, dots)=>
        this._setupCB = setupCB                 // custom ratio pos target (Shape, dots)=>
        this._fragile = fragile||false          // whether the shape resets on document visibility change 
    }

    initialize() {
        if (typeof this._initDots == "string") this.createFromString(this._initDots)
        else if (typeof this._initDots == "function") this._initDots(this, this._cvs, this._pos)
        else if (this._initDots?.length) this.add(this._initDots)
        
        if (typeof this._initPos == "function") this._pos = this._initPos(this, this._dots)

        if (typeof this._setupCB == "function") this._setupCB(this)
        
        this._dots.forEach(d=>d.initialize())
    }

    draw() {
        if (typeof this._ratioPosCB == "function") this._ratioPos = this._ratioPosCB(this)
    }

    add(dot) {
        this._dots.push(...[dot].flat().map(x=>{
            x.rgba = [...this._rgba]
            x.radius ??= this._radius
            x.parent = this
            return x
        }))
    }

    remove(id) {
        this._dots = this._dots.filter(x=>x!==id)
    }

    createFromString(str, topLeftPos=[0,0], gaps=[25, 25], dotChar="o") {//
        let dots = []
        str.split("\n").filter(x=>x).forEach((x,i)=>{
            let [atX, atY] = topLeftPos
            atY+=i*gaps[1];
            [...x].forEach(c=>{
                if (c==dotChar) dots.push(new Dot(atX+gaps[0]/2, atY+gaps[1]/2))
                atX+=gaps[0]
            })
        })
        return dots
    }

    setRadius(radius) {
        this._radius = radius
        this._dots.forEach(x=>x.radius=radius)
    }

    setRGBA(rgba) {
        this._rgba = rgba
        this._dots.forEach(x=>x.rgba=rgba)
    }

    setLimit(limit) {
        this._limit = limit
        this._dots.forEach(x=>x.limit=limit)
    }

    moveBy(x, y) {// to fix
        this._dots.forEach(d=>{
            if (x) d.x += x
            if (y) d.y += y
        })
    }

    move(x, y) {
        this._dots.forEach(d=>{
            if (x && x!==this._pos[0]) d.x += x-this._pos[0]
            if (y && y!==this._pos[1]) d.y += y-this._pos[1]
        })
        this._pos = [x??this._pos[0], y??this._pos[1]]
    }

    scale(scale, dotRelative) {// to fix
        //let distX = (this._pos[0]-this._dots[0].x)*(scale[0]??scale), distY = (this._pos[1]-this._dots[0].y)*(scale[1]??scale)
        //this._dots.forEach(d=>{
        //    if (dotRelative) {
        //        d.x = d.x * (scale[0]??scale)-(d.x-this._pos[0])
        //        d.y = d.y * (scale[1]??scale)-(d.y-this._pos[1])
        //    } else {
        //        d.x = d.initPos[0]*(scale[0]??scale)
        //        d.y = d.initPos[1]*(scale[1]??scale)
        //    }
        //})
    }

    clear() {
        this._dots = []
    }

    reset() {
        if (this._initDots) {
            this.clear()
            this.initialize()
        }
    }

    asSource() {
        return {[Shape.childrenPath]:this}
    }

    static asSource(shape) {
        return {[Shape.childrenPath]:shape}
    }

    get cvs() {return this._cvs}
    get ctx() {return this._cvs.ctx}
    get id() {return this._id}
	get pos() {return this._pos}
    get x() {return this._pos[0]}
    get y() {return this._pos[1]}
    get dots() {return this._dots}
    get rgba() {return this._rgba}
    get radius() {return this._radius}
    get limit() {return this._limit}
	get initDots() {return this._initDots}
    get r() {return this._rgba[0]}
    get g() {return this._rgba[1]}
    get b() {return this._rgba[2]}
    get a() {return this._rgba[3]}
    get drawEffectCB() {return this._drawEffectCB}
    get ratioPos() {return this._ratioPos}
    static get childrenPath() {return "dots"}
    get ratioPosCB() {return this._ratioPosCB}
    get setupCB() {return this._setupCB}

    set cvs(cvs) {this._cvs = cvs}
	set pos(_pos) {return this._pos = _pos}
    set ratioPos(ratioPos) {this._ratioPos = ratioPos}
    set drawEffectCB(cb) {this._drawEffectCB = cb}
    set ratioPosCB(cb) {this._ratioPosCB = cb}
    set setupCB(cb) {this._setupCB = cb}
} 

// JS
// Canvas Dot Effects by Louis-Charles Biron
// Please don't use or credit this code as your own.
//
const ACCEPTABLE_DIF = 0.0000001

function random(min, max, decimals=0) {
    return +(Math.random()*(max-min)+min).toFixed(decimals)
}

class FPSCounter {
    constructor(avgSampleSize) {
        this._t = []
        this._maxFps=0
        this._avgSampleSize = avgSampleSize||10
        this._avg = []
    }

    getFpsRaw() {//run in the loop
        let n=performance.now(), fps
        while (this._t.length>0 && this._t[0]<=n-1000) this._t.shift()
        fps = this._t.push(n)
        if (this._maxFps < fps) this._maxFps = fps
        return fps
    }

    getFps() {//or run in the loop
        this._avg.push(this.getFpsRaw())
        if (this._avg.length > this._avgSampleSize) this._avg.shift()
        return Math.floor(Math.min(this._avg.reduce((a, b)=>a+b,0)/this._avgSampleSize, this._maxFps))
    }

    get maxFps() {return this._maxFps-1}
    get avgSample() {return this._avgSampleSize}
    get fpsRaw() {return this._t.length}
    
    set avgSample(s) {this._avgSampleSize = s}
}

Array.prototype.last=function(index=0){return this[this.length-1-index]}

function getDist(x1, y1, x2, y2) {
    return Math.sqrt((x1-x2)**2 + (y1-y2)**2)
}

function mod(max, ratio, range) {
    range??=max
    return max-ratio*range+max*((range>=0)-1)
}

function formatColor(rgba) {
    return `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${rgba[3]})`
}

function toRad(deg) {
    return deg*(Math.PI/180)
}

function toDeg(rad) {
    return rad/(Math.PI/180)
}

function getAcceptableDif(n, okDif) {
    return Math.round(n)-n <= okDif ? Math.round(n) : n
}

const SHOW_CENTERS_DOT_ID = {}
function toggleCenter(shape, radius=5, color=[255,0,0,1]) {
    if (!SHOW_CENTERS_DOT_ID[shape.id]) {
        let dot = new Dot(()=>[shape.x, shape.y], radius, color)
        SHOW_CENTERS_DOT_ID[shape.id] = dot.id
        CVS.add(dot, true)
    } else {
        CVS.remove(SHOW_CENTERS_DOT_ID[shape.id])
        SHOW_CENTERS_DOT_ID[shape.id] = undefined
    }
}

// GENERICS //
function _drawDotConnections(dot, rgba=[255,255,255,1], isSourceOver=false) {
    let ctx = dot.ctx
    if (!isSourceOver) ctx.globalCompositeOperation = "destination-over"
    if (dot.connections.length) dot.connections.forEach(c=>{
         ctx.strokeStyle = formatColor(rgba)
         ctx.beginPath()
         ctx.moveTo(dot.x, dot.y)
         ctx.lineTo(c.x, c.y)
         ctx.stroke()
     })
     if (!isSourceOver) ctx.globalCompositeOperation = "source-over"
}

function _drawOuterRing(dot, rgba=[255,255,255,1], multiplier) {
    let ctx = dot.ctx
    ctx.strokeStyle = formatColor(rgba)
    ctx.beginPath()
    ctx.arc(dot.x, dot.y, dot.radius*multiplier, 0, CIRC)
    ctx.stroke()
}

function _drawConnections(dot, rgba=[255,255,255,1], sourcePos) {
    let ctx = dot.ctx
    ctx.strokeStyle = formatColor(rgba)
    ctx.beginPath()
    ctx.moveTo(sourcePos[0], sourcePos[1])
    ctx.lineTo(dot.x, dot.y)
    ctx.stroke()
} 


let animIdGiver = 0
class Anim {
    constructor(animation, duration, easing, endCallback) {
        this._id = animIdGiver++                    
        this._animation = animation                 //the main animation (progress)=>
        this._duration = duration??1000             //duration in ms
        this._easing = easing||(x=>x)               //easing function (x)=>
        this._endCallback = endCallback             //function called when animation is over

        this._startTime = null                      //start time
        this._progress = 0                          //animation progress
        this._hasEnded = false                      //if animation has ended

        this._frame = 0                             //current frame count
    }

    getFrame(time) {//run in loop
        if (!this._hasEnded) {
            // SET START TIME
            if (this._startTime==null) this._startTime = time
            // PLAY ANIMATION
            if (time<this._startTime+this._duration) {
                this._frame++
                this._animation(this._progress = this._easing((time-this._startTime)/this._duration))}
            // END
            else this.end()
        }
    }

    end() {
        this._frame++
        this._animation(1)
        this._hasEnded = true
        if (typeof this._endCallback == "function") this._endCallback()
    }

    reset() {
        this._progress = 0
        this._hasEnded = false
        this._startTime = null
    }

    get id() {return this._id}
    get animation() {return this._animation}
	get duration() {return this._duration}
	get easing() {return this._easing}
	get endCallback() {return this._endCallback}
	get startTime() {return this._startTime}
	get progress() {return this._progress}
	get hasEnded() {return this._hasEnded}

	set animation(_animation) {return this._animation = _animation}
	set duration(_duration) {return this._duration = _duration}
	set easing(_easing) {return this._easing = _easing}
	set endCallback(_endCallback) {return this._endCallback = _endCallback}


    static get easeInOutQuad() {
        return (x)=>x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2
    }

    static get easeOutQuad() {
        return (x)=>1 - (1 - x) * (1 - x)
    }
} 


// JS
// Canvas Dot Effects by Louis-Charles Biron
// Please don't use or credit this code as your own.
//

const DEFAULT_MAX_DELTATIME= 0.13, DEFAULT_CVSDE_ATTR = "_CVSDE", DEFAULT_CVSFRAMEDE_ATTR = "_CVSDE_F", DEFAULT_CTX_SETTINGS = {"lineCap":"round", "imageSmoothingEnabled":false, "lineWidth":2, "fillStyle":"aliceblue", "stokeStyle":"aliceblue"}, TIMEOUT_FN = window.requestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame||window.msRequestAnimationFrame, CIRC = 2*Math.PI, DEFAULT_COLOR = "aliceblue", DEFAULT_RGBA=[255,255,255,1], DEFAULT_RADIUS = 5, DEFAULT_CANVAS_WIDTH = 800, DEFAULT_CANVAS_HEIGHT = 800, DEFAULT_CANVAS_STYLES = {position:"absolute",width:"100%",height:"100%","background-color":"transparent",border:"none",outline:"none","pointer-events":"none !important","z-index":0,padding:"0 !important",margin:"0"}, DEFAULT_MOUSE_DECELERATION = 0.8, DEFAULT_MOUSE_MOVE_TRESHOLD = 0.1, DEFAULT_MOUSE_ANGULAR_DECELERATION = 0.2
let idGiver = 0

class Canvas {
    //privates
    #lastFrame = 0  // used for delta time calcultions
    #deltaTimeCap = DEFAULT_MAX_DELTATIME // used to prevent significant delta time gaps
    #frameSkipsOffset = null // used to prevent significant frame gaps
    #timeStamp = null  // requestanimationframe timestamp in ms

    constructor(cvs, loopingCallback, frame, settings=DEFAULT_CTX_SETTINGS) {
        this._cvs = cvs                                         //html canvas el
        this._frame = frame??cvs?.parentElement                 //html parent el
        this._cvs.setAttribute(DEFAULT_CVSDE_ATTR, true)        //styles selector
        this._frame.setAttribute(DEFAULT_CVSFRAMEDE_ATTR, true) //styles selector
        this._ctx = this._cvs.getContext("2d")                  //ctx
        this._settings = this.updateSettings(settings)          //ctx settings

        this._els={refs:[], defs:[]}                            //arrs of objects to .draw() | refs: [{Object._arrName:Object}], defs: [regular drawable objects]

        this._looping = false                                   //loop state
        this._cb = loopingCallback                              //custom callback called along with the loop() function

        this._deltaTime = null                                  //useable delta time in seconds
        this._fixedTimeStamp = null                             //fixed (offsets lag spikes) requestanimationframe timestamp in ms

        this._windowListeners = this.initWindowListeners()      //[onresize, onvisibilitychange]
        
        let frameCBR = this._frame?.getBoundingClientRect()??{width:DEFAULT_CANVAS_WIDTH, height:DEFAULT_CANVAS_HEIGHT}
        this.setSize(frameCBR.width, frameCBR.height)           //init size
        this.initStyles()                                       //init styles

        this._mouse = {}                                        //mouse info
        this._offset = this.updateOffset()                      //cvs page offset
    }

    initStyles() {
        let style = document.createElement("style")
        style.appendChild(document.createTextNode(`[${DEFAULT_CVSFRAMEDE_ATTR}]{position:relative !important;}canvas[${DEFAULT_CVSDE_ATTR}]{${Object.entries(DEFAULT_CANVAS_STYLES).reduce((a,b)=>a+=`${b[0]}:${b[1]};`,"")}}`))
        this._cvs.appendChild(style)
    }

    initWindowListeners() {
        const onresize=()=>{this.setSize()},
        onvisibilitychange=()=>{if (!document.hidden) this.reset()}

        window.addEventListener("resize", onresize)
        window.addEventListener("visibilitychange", onvisibilitychange)
        return [()=>window.removeEventListener("resize", onresize), ()=>window.removeEventListener("visibilitychange", onvisibilitychange)]
    }

    updateOffset() {
        let {width, height, x, y} = this._cvs.getBoundingClientRect()
        return this._offset = {x:Math.round((x+width)-this.width+window.scrollX), y:Math.round((y+height)-this.height+window.scrollY)}
    }

    startLoop() {
        if (!this._looping) {
            this._looping = true
            this.loop(0)
        }
    }

    loop(time) {
        let delay = Math.abs((time-this.#timeStamp)-this.deltaTime*1000)
        if (this._fixedTimeStamp==0) this._fixedTimeStamp = time-this.#frameSkipsOffset
        if (time && this._fixedTimeStamp && delay < DEFAULT_MAX_DELTATIME*1000) {

            this.calcMouseSpeed()

            this.clear()
            this.draw()
            
            if (typeof this._cb == "function") this._cb()

            this._fixedTimeStamp = 0

        } else if (time) {
            this._fixedTimeStamp = time-(this.#frameSkipsOffset += DEFAULT_MAX_DELTATIME*1000)
            this.#frameSkipsOffset += DEFAULT_MAX_DELTATIME*1000
        }

        this.#timeStamp = time
        this.calcDeltaTime(time)
        if (this._looping) TIMEOUT_FN(this.loop.bind(this))
    }

    stopLoop() {
        this._looping = false
    }

    calcDeltaTime(time=0) {
        this._deltaTime = Math.min((time-this.#lastFrame)/1000, this.#deltaTimeCap)
        this.#lastFrame = time
    }

    draw() {
        [...this._els.defs, ...this.refs, ...this._els.refs.flatMap(x=>{
            let o=Object.entries(x)
            return o[0][1][o[0][0]]
        })].forEach(el=>{
            if (el.draw) el.draw(this._ctx, this.timeStamp)
        })
    }

    clear(x=0, y=0, width, height) {
        this._ctx.clearRect(x??0, y??0, width??this._cvs.width, height??this._cvs.height)
    }

    reset() {
        this.refs.filter(x=>x.fragile).forEach(r=>r.reset())
    }

    setSize(w, h) {
        let {width, height} = this._frame.getBoundingClientRect()
        if (w!==null) this._cvs.width = w??width
        if (h!==null) this._cvs.height = h??height
        this.updateSettings()
        this.updateOffset()
    }

    updateSettings(settings) {
        let st = settings||this._settings
        Object.entries(st).forEach(s=>this._ctx[s[0]]=s[1])
        return this._settings=st
    }

    add(objs, isDef) {
        let l = objs.length??1
        for (let i=0;i<l;i++) {
            let o = objs[i]??objs
            if (!isDef) {
                let ref = Object.values(o)[0]
                ref.cvs = this
                ref.initialize()
            } else {
                o.parent = this
                o.initialize()
            }
            this._els[isDef?"defs":"refs"].push(o)
        }
    }

    remove(id) {
        this._els.defs = this._els.defs.filter(x=>x.id!==id)
        this._els.refs = this._els.refs.filter(x=>Object.values(x)[0].id!==id)
    }

    get(id) {
        return this.allEls.find(el=>el.id == id)
    }

    getObjs(instance) {
        return this._els.defs.filter(x=>x instanceof instance)
    }

    calcMouseSpeed() {
        // MOUSE SPEED
        if (isFinite(this._mouse.lastX) && isFinite(this._mouse.lastY) && this._deltaTime) {
            this._mouse.speed = this._mouse.speed*DEFAULT_MOUSE_DECELERATION+(getDist(this._mouse.x, this._mouse.y, this._mouse.lastX, this._mouse.lastY)/this._deltaTime)*(1-DEFAULT_MOUSE_DECELERATION)
            if (this._mouse.speed < DEFAULT_MOUSE_MOVE_TRESHOLD) this._mouse.speed = 0
        } else this._mouse.speed = 0

        this._mouse.lastX = this._mouse.x
        this._mouse.lastY = this._mouse.y
    }

    #mouseMovements(cb, e) {
        this.refs.forEach(r=>{
            if (r.ratioPosCB===undefined) r.ratioPos=[this._mouse.x,this._mouse.y]
        })
        if (typeof cb == "function") cb(this._mouse, e)
    }

    setmousemove(cb) {
        const onmousemove=e=>{
            // MOUSE POS
            this._mouse.x = e.x-this._offset.x,
            this._mouse.y = e.y-this._offset.y

            // MOUSE ANGLE
            let dx = this._mouse.x-this._mouse.lastX, dy = this._mouse.y-this._mouse.lastY
            if (isFinite(dx) && isFinite(dy) && (dx||dy)) {
                    let angle = (-toDeg(Math.atan2(dy, dx))+360)%360
                    let diff = angle-this._mouse.dir
                    diff += (360*(diff<-180))-(360*(diff>180))

                    this._mouse.dir = (this._mouse.dir+diff*DEFAULT_MOUSE_ANGULAR_DECELERATION+360)%360
            } else this._mouse.dir = 0

            this.#mouseMovements(cb, e)
        }
        this._frame.addEventListener("mousemove", onmousemove)
        return ()=>this._frame.removeEventListener("mousemove", onmousemove)
    }

    setmouseleave(cb) {
        const onmouseleave=e=>{
            this._mouse = {x:Infinity, y:Infinity}
            this.#mouseMovements(cb, e)
        }
        this._frame.addEventListener("mouseleave", onmouseleave)
        return ()=>this._frame.removeEventListener("mouseleave", onmouseleave)
    }

    #mouseClicks(cb, e) {
        let v = e.type=="mousedown"
        if (e.button==0) this._mouse.clicked = v
        else if (e.button==1) this._mouse.scrollClicked = v
        else if (e.button==2) this._mouse.rightClicked = v
        else if (e.button==3) this._mouse.extraBackClicked = v
        else if (e.button==4) this._mouse.extraForwardClicked = v

        if (typeof cb == "function") cb(this._mouse, e)
    }

    setmousedown(cb) {
        const onmousedown=e=>this.#mouseClicks(cb, e)
        
        this._frame.addEventListener("mousedown", onmousedown)
        return ()=>this._frame.removeEventListener("mousedown", onmousedown)
    }

    setmouseup(cb) {
        const onmouseup=e=>this.#mouseClicks(cb, e)
        
        this._frame.addEventListener("mouseup", onmouseup)
        return ()=>this._frame.removeEventListener("mouseup", onmouseup)
    }
    
	get cvs() {return this._cvs}
	get frame() {return this._frame}
	get ctx() {return this._ctx}
	get width() {return this._cvs.width}
	get height() {return this._cvs.height}
	get settings() {return this._settings}
	get cb() {return this._cb}
	get looping() {return this._looping}
	get deltaTime() {return this._deltaTime}
	get deltaTimeCap() {return this.#deltaTimeCap}
	get windowListeners() {return this._windowListeners}
	get timeStamp() {return this._fixedTimeStamp||this.#timeStamp}
	get timeStampRaw() {return this.#timeStamp}
	get els() {return this._els}
	get mouse() {return this._mouse}
	get offset() {return this._offset}
    get defs() {return this._els.defs}
    get refs() {return this._els.refs.flatMap(x=>Object.values(x))}
    get allEls() {return this.defs.concat(this.refs)}

	set cb(_cb) {return this._cb = _cb}
	set width(w) {this.setSize(w, null)}
	set height(h) {this.setSize(null, h)}
	set mouse(m) {this._mouse = m}
} 


// JS
// Canvas Dot Effects by Louis-Charles Biron
// Please don't use or credit this code as your own.
//

class Dot {
    constructor(pos, radius, rgba, setupCB) {
        this._id = idGiver++
        this._initPos = pos||[0,0]
        this._pos = this._initPos
        this._radius = radius
        this._rgba = rgba
        this._parent = null
        this._anims = []
        this._connections = []    
        this._setupCB = setupCB    
    }

    initialize() {
        if (typeof this._pos == "function") this._pos = this._initPos(this, this._parent)
        if (typeof this._setupCB == "function") this._setupCB(this, this._parent)
    }

    draw(ctx, time) {
        ctx.fillStyle = formatColor(this._rgba||DEFAULT_RGBA)
        ctx.beginPath()
        ctx.arc(this.x, this.y, this._radius??DEFAULT_RADIUS, 0, CIRC)
        ctx.fill()

        if (typeof this.drawEffectCB == "function") {
            let dist = this.getDistance(), rawRatio = this.getRatio(dist)
            this.drawEffectCB(ctx, this, Math.min(1, rawRatio), this.cvs.mouse, dist, rawRatio)
        }

        if (this._anims[0]) this._anims[0].getFrame(time)
    }

    getDistance(fx,fy) {
        return getDist(fx??this.ratioPos[0], fy??this.ratioPos[1], this.x, this.y)
    }

    getRatio(dist) {
        return dist / this.limit
    }

    queueAnim(anim, force) {
        if (this.currentAnim && force) this.currentAnim.end()
        if (!anim.endCallback) anim.endCallback=()=>{this._anims.shift()}
        this._anims.push(anim)
        return anim
    }

    addConnection(dot) {
        if (typeof dot == "object") this._connections.push(dot)
    }

    removeConnection(dotId) {
        this._connections = this._connections.filter(d=>typeof dotId=="number"?d.id!==dotId:d.id!==dotId.id)
    }

    addForce(force, dir, time=1000, easing=Anim.easeInOutQuad) {
        let rDir = toRad(dir), ix = this.x, iy = this.y,
            dx = getAcceptableDif(force*Math.cos(rDir), ACCEPTABLE_DIF),
            dy = getAcceptableDif(force*Math.sin(rDir), ACCEPTABLE_DIF)
    
        return this.queueAnim(new Anim((prog)=>{
            this.x = ix+dx*prog
            this.y = iy-dy*prog
        }, time, easing, ()=>this._anims.shift()), true)
    }

    follow(duration, easing, action,  ...progressSeparations) {
        let [ix, iy] = this._pos
        this.queueAnim(new Anim((prog)=>{
            let fn = Object.entries(progressSeparations.reduce((a,b)=>Object.keys(b)[0]>prog?a:b))[0], [nx, ny] = fn[1](prog, prog-fn[0], this, ix, iy)
            this.x = ix+nx
            this.y = iy+ny
            if (typeof action == "function") action(prog, this)
        }, duration, easing))

    }

    remove() {
        this._parent.remove(this._id)
    }

    get id() {return this._id}
    get x() {return this._pos[0]}
    get y() {return this._pos[1]}
    get pos() {return this._pos}
    get pos_() {return [...this._pos]}
    get radius() {return this._radius}
	get initPos() {return this._initPos}
    get rgba() {return this._rgba}
    get r() {return this._rgba[0]}
    get g() {return this._rgba[1]}
    get b() {return this._rgba[2]}
    get a() {return this._rgba[3]}
    get parent() {return this._parent}
    get drawEffectCB() {return this._parent?.drawEffectCB}
    get limit() {return this._parent?.limit}
    get ratioPos() {return this._parent?.ratioPos}
    get cvs() {return this._parent?.cvs}
    get ctx() {return this._parent?.cvs.ctx}
    get anims() {return this._anims}
    get currentAnim() {return this._anims[0]}
    get connections() {return this._connections}

    set x(x) {this._pos[0] = x}
    set y(y) {this._pos[1] = y}
    set limit(limit) {this._limit = limit}
    set radius(radius) {this._radius = radius}
    set r(r) {this._rgba[0] = r}
    set g(g) {this._rgba[1] = g}
    set b(b) {this._rgba[2] = b}
    set a(a) {this._rgba[3] = a}
    set rgba(rgba) {this._rgba = rgba}
    set parent(p) {this._parent = p}
    set connections(c) {return this._connections = c}
} 


// JS
// Canvas Dot Effects by Louis-Charles Biron
// Please don't use or credit this code as your own.
//
class Grid extends Shape {
    constructor(keys, gaps=[25, 25], spacing, source, pos, radius, rgba, limit, drawEffectCB, ratioPosCB, setupCB, fragile) {
        super(pos, null, radius, rgba, limit, drawEffectCB, ratioPosCB, setupCB, fragile)

        this._keys = keys                                                                                         // keys to convert to source's values 
        this._gaps = gaps ?? [25, 25]                                                                             // [x, y] gap length within the dots
        this._source = source ?? fontSource5x5                                                                    // symbols' source 
        this._spacing = spacing ?? this._source.width*this._gaps[0]+this._gaps[0]-this._source.width+this._radius // gap length within symbols

        if (this._keys) super.add(this.createGrid())
    }

    createGrid(keys=this._keys, pos=super.pos, gaps=this._gaps, spacing=this._spacing, source=this._source) {
        let [cx, cy] = pos, isNewLine=true, symbols=[]
        ;[...keys].forEach(l=>{
            let symbol = this.createSymbol(l, [cx=(l=="\n")?pos[0]:(cx+spacing*(!isNewLine)), cy+=(l=="\n")&&source.width*gaps[1]+this.radius])
            isNewLine = (l=="\n")
            symbols.push(symbol)
        })
        return symbols.flat()
    }

    createSymbol(symbol, pos=super.pos) {
        let dotGroup = [], [gx, gy] = this._gaps, xi=[0,0], yi=0, s = this._source[symbol.toUpperCase()],
        ar = Math.sqrt(this._source.width*this._source.height) // source radius
        
        if (s) s.map((d,i)=>[new Dot([pos[0]+(xi[0]=d[0]??xi[0]+1,isNaN(Math.abs(d[0]))?xi[0]:Math.abs(d[0]))*gx, pos[1]+(yi+=(xi[0]<=xi[1]||!i)||Math.sign(1/xi[0])==-1)*gy]), d[1], yi*ar+(xi[1]=Math.abs(xi[0]))]).forEach(([dot, c, p],_,a)=>{
            D.places.forEach(dir=>{c&dir[0]&&dot.addConnection(a.find(n=>n[2]==p+dir[1](ar))?.[0])}) 
            dotGroup.push(dot)
        })
        return dotGroup
    }

    updateKeys(keys) {
        // can be optimised
        super.clear()
        this._keys = keys
        super.add(this.createGrid())
    }

    updateGaps(gaps) {
        super.clear()
        this._gaps = gaps
        super.add(this.createGrid())
    }

    updateSpacing(spacing) {
        super.clear()
        this._spacing = spacing
        super.add(this.createGrid())
    }

    updateSource(source) {
        super.clear()
        this._source = source
        super.add(this.createGrid())
    }

    get keys() {return this._keys}
	get gaps() {return this._gaps}
	get spacing() {return this._spacing}
	get source() {return this._source}

	set keys(keys) {return this._keys = keys}
	set gaps(gaps) {return this._gaps = gaps}
	set spacing(spacing) {return this._spacing = spacing}
	set source(source) {return this._source = source}
} 



const D = [["t","-ar"],["r",1],["b","ar"],["l",-1],["tr","1-ar"],["br","ar+1"],["bl","ar-1"],["tl","-ar-1"]].reduce((a,[b,d],i)=>(a.places.push([a[b]=1<<i,(ar)=>new Function("ar",`return ${d}`)(ar)]),a),{places:[]})


const fontSource5x5 = {
    width:5,
    height:5,
    A: [
        [2,D.bl+D.br],
        [1,D.bl],[3,D.br],
        [0,D.r+D.b],[1,D.r],[2,D.r],[3,D.r],[4,D.b],
        [0,D.b],[4,D.b],
        [0],[4]
    ],
    B: [
        [0,D.r+D.b],[,D.r],[,D.r],[,D.br],
        [0,D.b],[4,D.bl],
        [0,D.r+D.b],[,D.r],[,D.r],[,D.br],
        [0,D.b],[4,D.bl],
        [0,D.r],[,D.r],[,D.r],[]
    ],
    C: [
        [1,D.r+D.bl],[,D.r],[,D.r],[],
        [0,D.b],
        [0,D.b],
        [0,D.br],
        [-1,D.r],[2,D.r],[,D.r],[]
      ],
    D: [
        [0,D.r+D.b],[,D.r],[,D.r],[,D.br],
        [0,D.b],[4,D.b],
        [0,D.b],[4,D.b],
        [0,D.b],[4,D.bl],
        [0,D.r],[,D.r],[,D.r],[]
    ],E: [
        [0,D.r+D.b],[,D.r],[,D.r],[,D.r],[],
        [0,D.b],
        [0,D.b+D.r],[,D.r],[,D.r],[,D.r],
        [0,D.b],
        [0,D.r],[,D.r],[,D.r],[,D.r],[]
    ],F: [
        [0,D.r+D.b],[,D.r],[,D.r],[,D.r],[],
        [0,D.b],
        [0,D.b+D.r],[,D.r],[,D.r],[],
        [0,D.b],
        [0]
    ],G: [
        [1,D.r+D.bl],[,D.r],[,D.r],[],
        [0,D.b],
        [0,D.b],[3,D.r],[4,D.b],
        [0,D.br],[4,D.b],
        [1,D.r],[,D.r],[,D.r],[]
    ],H: [
        [0,D.r+D.b],[4,D.b],
        [0,D.b],[4,D.b],
        [0,D.b+D.r],[,D.r],[,D.r],[,D.r],[,D.b],
        [0,D.b],[4,D.b],
        [0],[4]
    ],I: [
        [1,D.r],[,D.b+D.r],[],
        [2,D.b],
        [2,D.b],
        [2,D.b],
        [1,D.r],[,D.r],[]
    ],J: [
        [1,D.r],[,D.r],[,D.b+D.r],[],
        [3,D.b],
        [3,D.b],
        [0,D.br],[3,D.bl],
        [1,D.r],[,D.r]
    ],K: [
        [0,D.b],[3,D.bl],
        [0,D.b],[2,D.bl],
        [0,D.b+D.r],[,D.r+D.br],
        [0,D.b],[2,D.br],
        [0],[3,D.r]
    ],L: [
        [0,D.b],
        [0,D.b],
        [0,D.b],
        [0,D.b],
        [0,D.r],[,D.r],[,D.r],[,D.r]
    ],M: [
        [0,D.b+D.br],[4,D.b+D.bl],
        [0,D.b],[,D.br],[3,D.bl],[4,D.b],
        [0,D.b],[2],[4,D.b],
        [0,D.b],[4,D.b],
        [0],[4]
    ],N: [
        [0,D.b+D.br],[4,D.b],
        [0,D.b],[,D.br],[4,D.b],
        [0,D.b],[2,D.br],[4,D.b],
        [0,D.b],[3,D.br],[4,D.b],
        [0],[4]
    ],O: [
        [1,D.bl+D.r],[,D.r],[,D.br],
        [0,D.b],[4,D.b],
        [0,D.b],[4,D.b],
        [0,D.b+D.br],[4,D.b+D.bl],
        [1,D.r],[,D.r],[,D.r]
    ],P: [
        [0,D.r+D.b],[,D.r],[,D.br],
        [0,D.b],[3,D.bl],
        [0,D.b+D.r],[,D.r],[],
        [0,D.b],
        [0]
    ],Q: [
        [1,D.bl+D.r],[,D.r],[,D.br],
        [0,D.b],[4,D.b],
        [0,D.b],[4,D.b],
        [0,D.b+D.br],[3,D.br],[,D.bl],
        [1,D.r],[,D.r],[],[]
    ],R: [
        [0,D.r+D.b],[,D.r],[,D.br],
        [0,D.b],[3,D.bl],
        [0,D.b+D.r],[,D.r+D.br],[],
        [0,D.b],[2,D.br],
        [0],[3]
    ],S: [
        [1,D.r+D.bl],[,D.r],[,D.r],[],
        [0,D.br],
        [-1,D.r],[2,D.r],[,D.br],
        [-4,D.bl],
        [0,D.r+D.bl],[,D.r],[,D.r],[]
    ],T: [
        [0,D.r],[,D.r],[,D.b+D.r],[,D.r],[],
        [2,D.b],
        [2,D.b],
        [2,D.b],
        [2]
    ],U: [
        [0,D.r+D.b],[4,D.b],
        [0,D.b],[4,D.b],
        [0,D.b+D.r],[4,D.b],
        [0,D.br],[4,D.bl],
        [1,D.r],[,D.r],[,D.r]
    ],V: [
        [0,D.r+D.b],[4,D.b],
        [0,D.b],[4,D.b],
        [0,D.br],[4,D.bl],
        [1,D.br],[3,D.bl],
        [2,D.r],
    ],W: [
        [0,D.b+D.br],[4,D.b+D.bl],
        [0,D.b],[4,D.b],
        [0,D.b],[2,D.bl+D.br],[4,D.b],
        [0,D.b],[,D.bl],[3,D.br],[4,D.b],
        [0],[4]
    ],X: [
        [0,D.br],[4,D.bl],
        [1,D.br],[3,D.bl],
        [2,D.br+D.bl],
        [1,D.bl],[3,D.br],
        [0],[4]
    ],Y: [
        [0,D.br],[4,D.bl],
        [1,D.br],[3,D.bl],
        [2,D.b],
        [2,D.b],
        [2]
    ],Z: [
        [0,D.r],[,D.r],[,D.r],[,D.r],[,D.bl],
        [3,D.bl],
        [2,D.bl],
        [1,D.bl],
        [0,D.r],[,D.r],[,D.r],[,D.r],[]
    ]
} 

