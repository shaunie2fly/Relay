
import { serve } from "https://deno.land/std@0.178.0/http/server.ts"

const RELAYPORT = parseInt(Deno.env.get('PORT') as string) || 9099
const DEBUG = (Deno.env.get('DEBUG') === 'true') ? true: false;

// look for any 'help' request
const arg0 = Deno.args[0];
if (arg0 === '-h' || arg0 === '?') {
   console.log(`
Relay Service Help --
Usage:
commandline options:
-h  or ? this help text.
This service is used To stream data between apps. `
   );
   Deno.exit(0);
};


// Start our Server
serve(handleRequest, { hostname: "localhost", port: RELAYPORT })
   .then(() => console.log("Server closed"))
   .catch((err) => console.info('Server caught error - ', err))

console.log('Service started on port:', RELAYPORT)


// Handle all http requests
async function handleRequest(request: Request): Promise<Response> {

   // get our request name and channel name
   const { pathname, searchParams } = new URL(request.url);
   
   // a request to subscribe for Server Sent Events?
   if (pathname.includes("subscribe")) {
      
      // get any channel name in the url (if none, defaults to 'relay')
      const channel = searchParams.get("channel") || "relay"
      
      if (DEBUG) console.log('Recieved a subscription request. channel ', channel)
      
      // registers this new client for a named stream (channel)
      return registerClient(request, channel)
   }

   // A POST request: client is publishing a message  
   else if (request.method === 'POST') {
      
      // unpack the envelope
      const data = await request.json();
      
      // get the channel name to publish to
      const channel = data.channel || 'relay'
      
      if (DEBUG) console.log('Client posted:', channel)
      
      // broadcast this payload to all listeners
      const bc = new BroadcastChannel(channel);
      bc.postMessage(data);
      bc.close();
      
      // acknowledge reciept of this request with a cors headers
      return new Response("", {
         status: 200,
         headers: {
            "content-type": "text/event-stream",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "no-cache"
         },
      })
   }

   // An unknown request - report it! 
   else {
      return await Promise.resolve(new Response(
         "Unknown request recieved: " + pathname, { status: 404 }
      ))
   }
}

/**             
 * Server Sent Events
 * Subscribes a client to a named relay channel stream
 */
function registerClient(_req: Request, channel: string): Response {

   // named channel per connection
   const relayChannel = new BroadcastChannel(channel);
   
   // configure a stream for this client on this channel name
   const stream = new ReadableStream({
      start: (controller) => {

         // listening for relayChannel messages
         relayChannel.onmessage = (e) => {
            const { channel, data } = e.data
            if (DEBUG) console.info(data)
            // pack it
            const reply = JSON.stringify({
               channel: channel,
               data: data
            })
            // send it
            controller.enqueue('data: ' + reply + '\n\n');
         }
      },
      cancel() {
         relayChannel.close();
      }
   })

   // stream all relay messages with cors header 
   return new Response(stream.pipeThrough(new TextEncoderStream()), {
      headers: {
         "content-type": "text/event-stream",
         "Access-Control-Allow-Origin": "*",
         "Cache-Control": "no-cache"
      },
   })
}
