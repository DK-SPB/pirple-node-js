// Primary file for the API

// Dependencies
import http from 'http';
import url from 'url';

// The server should respond to all requests with a string
const server = http.createServer((req, res) => {
    // Get the url and parse it
    const parsedUrl = url.parse(req.url, true);
    
    // Get the path
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace('/^\/+|\/+$/g', '');

    // Send the response
    res.end('hello world!\n');

    // Log the request path
    console.log(`Request received on path: ${trimmedPath}`);
});

// Start the server, and have it listen on port 3000
server.listen(3000, () => {
    console.log('The server is listening on port 3000 now');
});