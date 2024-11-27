let idGiver = 0

class Client {
    
    constructor(ip, ws) {
        this._id = idGiver++
        this._ip = ip
        this._ws = ws
    }

    send(obj) {
        this._ws.send(JSON.stringify(obj))
    }

    getSelf() {
        return {id:this._id, ip:this._ip}
    }


	get id() {return this._id}

	get ip() {return this._ip}

	get ws() {return this._ws}
}

module.exports = Client