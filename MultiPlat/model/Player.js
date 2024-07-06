let idGiver = 0

class Player {
    
    constructor(ip, ws, type, x, y, width, height, color, speed) {
        //CLIENT
        this.id = idGiver++ // id
        this.ip = ip // ipv4 address
        this.ws = ws // websocket
    
        //PLAYER
        this.t = type // type
        this.x = x // x pos
        this.y = y // y pos
        this.w = width // width
        this.h = height // width
        this.c = color // color
        this.s = speed // speed
    }

    send(obj) {
        this.ws.send(JSON.stringify(obj))
    }

    update(player) { //all attrs
        this.x = player.x
        this.y = player.y
        this.w = player.w
        this.h = player.h
        this.c = player.c
        this.s = player.s
    }

}

module.exports = Player;