

const Fastify = require("fastify");
const zmq = require("zeromq");

const app = Fastify({ logger: true });
const sock_pub = new zmq.Publisher();
const sock_pull = new zmq.Pull();

// Add a request queue with retry configuration
const requestQueue = [];
let isProcessing = false;
const MAX_RETRIES = 3;  // Maximum retry attempts
const RETRY_DELAY = 100;  // Retry delay in milliseconds

// Process requests one at a time
const processQueue = async () => {
  if (isProcessing || requestQueue.length === 0) return;
  
  isProcessing = true;
  const request = requestQueue.shift();
  const { mt5_id, resolve, reject, retries = 0 } = request;
  
  try {
    // Send request
    await sock_pub.send([mt5_id, "trade-request"]);
    
    // Wait for response with timeout
    const msg = await Promise.race([
      sock_pull.receive(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout")), 100)
      )
    ]);
    
    const tradeHistory = JSON.parse(msg.toString());
    resolve(tradeHistory);
  } catch (error) {
    console.error(`Request failed (attempt ${retries + 1}/${MAX_RETRIES}):`, error);
    
    // Check if we should retry
    if (retries < MAX_RETRIES) {
      console.log(`Retrying request for mt5_id: ${mt5_id} in ${RETRY_DELAY}ms...`);
      // Add the request back to queue with incremented retry count
      setTimeout(() => {
        requestQueue.push({ 
          mt5_id, 
          resolve, 
          reject, 
          retries: retries + 1 
        });
        processQueue();
      }, RETRY_DELAY);
    } else {
      // Max retries reached, reject the promise
      reject(new Error(`Failed after ${MAX_RETRIES} attempts: ${error.message}`));
    }
  } finally {
    isProcessing = false;
    // Process next request if any
    processQueue();
  }
};

// Modify your endpoint to use the queue with retry support
app.post("/nodeZeromq", async (request, reply) => {
  const { mt5_id } = request.body;
  
  if (!mt5_id) {
    return reply.status(400).send({ error: "Missing mt5_id" });
  }
  
  try {
    // Add request to queue and wait for result
    const result = await new Promise((resolve, reject) => {
      requestQueue.push({ mt5_id, resolve, reject, retries: 0 });
      processQueue(); // Try to process queue
    });
    
    return reply.send(result);
  } catch (error) {
    console.error("Fastify Error:", error);
    return reply.status(500).send({ error: error.message });
  }
});

// Binding the sockets and starting the server
const main = async () => {
  try {
    await sock_pub.bind("tcp://*:7777");
    await sock_pull.bind("tcp://*:6666");
    
    await app.listen({ port: 5000 });
    console.log("Fastify API running on http://localhost:5000");
  } catch (err) {
    console.error("Server startup error:", err);
    process.exit(1);
  }
};

main();