require("dotenv").config();

const http = require('http');
const app = require('./index');
const port = process.env.PORT || 8000;          //port creation

const  server = http.createServer(app);         // starting server    
server.listen(port);
console.log(`SERVER LISTENING ON PORT http://localhost:${port}`);