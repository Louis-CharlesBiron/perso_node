// index.js (Frontend)
console.log(Neutralino)

Neutralino.init();

// Dispatch event to backend
Neutralino.events.dispatch('backendEvent', { detail: "Hello Backend" });
