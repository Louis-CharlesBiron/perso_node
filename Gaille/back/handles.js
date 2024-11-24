function handle(type) {
    type=type.toLowerCase()

    // BINDINGS
    if (type=="kill") kill()
}

function kill() {
    process.exit()
}

module.exports = handle