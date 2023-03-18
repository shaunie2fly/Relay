
import * as Relay from './relay.js'

// Add an event listener for our 'Send' button.
// on click, will publish a message to the 'LOG' channel of the Relay service
document.getElementById('sendbtn').addEventListener("click", (e) => {
   const testObject = {name: 'Me', age: 74}
   const payload = JSON.stringify(testObject)
   Relay.publish(payload)
})

// Subscribe to Relay messages from a channel named 'LOG' 
Relay.subscribe("LOG", document.getElementById('logger'))
