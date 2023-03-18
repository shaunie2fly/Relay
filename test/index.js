
import * as Relay from './relay.js'

let id = 0

// Add an event listener for our 'Send' button.
// on click, will publish a message to the 'LOG' channel of the Relay service
document.getElementById('sendbtn').addEventListener("click", (e) => {
   const payLoad = { 
      topic: 'user', 
      user:{ 
         name: 'Me', 
         age: 74 
      } 
   }
   Relay.publish(JSON.stringify(payLoad))
})

// Subscribe to Relay messages from a channel named 'LOG' 
Relay.subscribe("LOG", document.getElementById('logger'))
