let idGiver = 0

class Client {

    
    constructor(ip, ws, auth) {
        this._id = idGiver++
        this._ip = ip
        this._ws = ws
        this._auth = auth // CLIENT | CONSOLE

        this.send({ type: "initAuth", value: this._id })
    }

    keepAwake() {
        this._ka = setInterval(() => {
            this.send({type:"keepAwake"})
        }, 10000)
    }

    send(obj) {
        this._ws.send(JSON.stringify(obj))
    }

    getSelf() {
        return {id:this._id, ip:this._ip, auth:this._auth}
    }





	get id() {return this._id}

	get ip() {return this._ip}

	get ws() {return this._ws}

	get auth() {return this._auth}

	get ka() {return this._ka}

    set auth(_auth) {
        if ((this._auth = _auth) == "client") this.keepAwake()
    }


}

module.exports = Client