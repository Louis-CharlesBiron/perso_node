const Neutralino = require('@neutralinojs/lib');

// Initialize Neutralino environment
Neutralino.init();
console.log("ASDASD")
// Log to the neutralino.log file
Neutralino.debug.log("Backend initialized.");

// Respond to custom events
Neutralino.events.on('backendEvent', (data) => {
    Neutralino.debug.log(`Backend received: ${JSON.stringify(data)}`);
});
