
import { publish, subscribe } from './client.js'

let id = 0
let channel = 'LOG'

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
   publish(channel, JSON.stringify(payLoad))
})

// Subscribe to Relay messages from a channel named 'LOG' 
subscribe(channel, document.getElementById('logger'))
