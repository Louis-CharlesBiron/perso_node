const {exec} = require("child_process"),
      scripts = require("./scripts")

// HANDLES ALL CALLS
function handle(obj) {
    let t = obj.type.toLowerCase(),
        v = obj.value

    // BINDINGS
    if (t=="kill") kill()
    else if (t=="setclickthrough") setClickThrough(v)
}

// CALLS DEFINITIONS //

// CLOSES SERVER
function kill() {
    process.exit()
}

// CHANGES SPECIFIC WINDOW'S CLICK-THROUGH ABILITIES
function setClickThrough(obj) {// {windowTitle:"", enabled:true}
    ps(`${scripts.CLICK_THROUGH} script "${obj.windowTitle}" "${obj.enabled}"`)
}

// POWERSHELL EVAL
function ps(cmd, callback) {
    exec(`powershell -ep Bypass -Command "${cmd.trim().replaceAll(/"/g,'\\"')}"`, (err, out)=>typeof callback=="function"&&callback(err, out))
}



module.exports = handle