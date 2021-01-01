/*
 * Primary file for API
 */

// Dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config.js');

// The server should response to all requests with a string
const server = http.createServer((req, res) => {

    // Get the URL and parse it
    const parsedUrl = url.parse(req.url, true);

    // Get the path
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace('/^\/+|\/+$/g', '');

    // Get the query string as an object 
    const queryStringObject = JSON.stringify(parsedUrl.query);

    // Get the HTTP method
    const method = req.method.toLowerCase();

    // Get the headers as an object
    const headers = JSON.stringify(req.headers);

    // Get the payload, if any
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });
    req.on('end', (data) => {
        buffer += decoder.end();

        // Choose the handler this request should go to
        const chosenHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        const dataObject = {
            'trimmedPath': trimmedPath,
            'headers': headers,
            'method': method,
            'queryStringObject': queryStringObject,
            'payload': buffer
        };

        chosenHandler(data, (statusCode, payload) => {
            statusCode = typeof (statusCode) == 'number' ? statusCode : 200;
            payload = typeof (payload) == 'object' ? payload : {};
            const payloadString = JSON.stringify(payload);

            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);

            console.log(`Returning the response: ${statusCode} ${payloadString}`);
        });
    });
});

// Create server and start on port 3000
server.listen(config.port, () => {
    console.log(`The server is listening on port ${config.port} in ${config.envName} now`);
});

// Define handlers
const handlers = {};

handlers.sample = (data, callback) => {
    callback(406, {
        'name': 'sample handler'
    });
};

handlers.notFound = (data, callback) => {
    callback(404);
};

// Define routing
const router = {
    '/sample': handlers.sample
};