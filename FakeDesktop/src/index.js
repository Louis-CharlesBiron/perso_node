



console.log("Hi")


document.onkeydown=e=>{
    if (e.key.toLowerCase() == "g") {
        console.log("ON")
        send({type:"setClickThrough", value:{windowTitle:"fakedesktop", enabled:true}})
    }
    if (e.key.toLowerCase() == "h") {
        console.log("OFF")
        send({type:"setClickThrough", value:{windowTitle:"fakedesktop", enabled:false}})
    }
}