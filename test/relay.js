
const SERVICE_URL = `http://localhost:9099`;
const DEBUG = true;

/** 
 * an optional screen logging element 
 */
let loggingGUI

/** 
 * of our Relay channel name 
 */
let channelName

/** 
 * initialize our EventSource channel
 * subscribes to Relay messages
 */ 
export const subscribe = (channel, loggerDomElement = null) => {
   channelName = channel
   // any local UI log element
   loggingGUI = loggerDomElement
   
   // this is our Relay client; we'll call her `eventSource`
   const eventSource = new EventSource(SERVICE_URL + `/subscribe/?channel=${channelName}`);
   
   // report an initial state
   log("CONNECTING");

   // on open; we'll notify UI
   eventSource.addEventListener("open", () => {
      // report the new state
      log("CONNECTED")
   });

   // notify any eventSource state change 
   eventSource.addEventListener("error", (_e) => {
      switch (eventSource.readyState) {
         case EventSource.OPEN:
            log("CONNECTED");
            break;
         case EventSource.CONNECTING:
            log("CONNECTING");
            break;
         case EventSource.CLOSED:
            reject("closed");
            log("DISCONNECTED");
            break;
      }
   });

   // catch all messages from the Relay service
   eventSource.addEventListener("message", (evt) => {
      const { data } = JSON.parse(evt.data)
      const { TS, from, payload } = data
      const msg = `payload: ${payload} from: ${from} at: ${TS}`
      if (DEBUG) console.info('Recieved: ', msg);
      log('Recieved: ' + msg)
   });
};

/**
 * Publish a message to a channel on the Relay service
 * @param {string} a string or json-string to publish
 */
export function publish(payload = '') {
   fetch(SERVICE_URL + "/", {
      method: "POST",
      body: JSON.stringify({
         channel: channelName,
         data: {
            TS: new Date().toLocaleTimeString('en-US'),
            from: "me",
            payload: payload
         }
      })
   });
   log('Published: ' + payload)
}

 function log(what = '') {
   if (loggingGUI) {
      loggingGUI.textContent += what + '\n'
   } else {
      console.log(what)
   }
 }
