const http = require("http");

// const log = loggingLibrary({ apiKey: "XYZ" });
const server = http.createServer((request, response) => {
    const requestStart = Date.now();

    let body = [];
    let requestErrorMessage = null;

    const getChunk = chunk => body.push(chunk);
    const assembleBody = () => {
        body = Buffer.concat(body).toString();
    };
    const getError = error => {
        requestErrorMessage = error.message;
    };
    request.on("data", getChunk);
    request.on("end", assembleBody);
    request.on("error", getError);

    const logClose = () => {
        removeHandlers();
        log(request, response, "Client aborted.", requestStart, body);
    };
    const logError = error => {
        removeHandlers();
        log(request, response, error.message, requestStart, body);
    };
    const logFinish = () => {
        removeHandlers();
        log(request, response, requestErrorMessage, requestStart, body);
    };
    response.on("close", logClose);
    response.on("error", logError);
    response.on("finish", logFinish);

    const removeHandlers = () => {
        request.off("data", getChunk);
        request.off("end", assembleBody);
        request.off("error", getError);
        response.off("close", logClose);
        response.off("error", logError);
        response.off("finish", logFinish);
    };

    process(request, response);
});

const process = (request, response) => {
    setTimeout(() => {
        response.end();
    }, 100);
};

const log = (request, response, errorMessage, requestStart, body) => {
    const { rawHeaders, httpVersion, method, socket, url } = request;
    const { remoteAddress, remoteFamily } = socket;

    const { statusCode, statusMessage } = response;
    const headers = response.getHeaders();

    console.log(
        JSON.stringify({
            timestamp: Date.now(),
            processingTime: Date.now() - requestStart,
            rawHeaders,
            body,
            errorMessage,
            httpVersion,
            method,
            remoteAddress,
            remoteFamily,
            url,
            response: {
                statusCode,
                statusMessage,
                headers
            }
        })
    );
};

// const log = (request, response, errorMessage) => {
//     const { rawHeaders, httpVersion, method, socket, url } = request;
//     const { remoteAddress, remoteFamily } = socket;

//     const { statusCode, statusMessage } = response;
//     const headers = response.getHeaders();

//     console.log(
//         JSON.stringify({
//             timestamp: Date.now(),
//             processingTime: Date.now() - requestStart,
//             rawHeaders,
//             body,
//             errorMessage,
//             httpVersion,
//             method,
//             remoteAddress,
//             remoteFamily,
//             url,
//             response: {
//                 statusCode,
//                 statusMessage,
//                 headers
//             }
//         })
//     );
// };

// const loggingLibrary = config => {
//     const loggingApiHeaders = {
//         Authorization: "Bearer " + config.apiKey
//     };

//     const log = (request, response, errorMessage, requestStart) => {
//         const { rawHeaders, httpVersion, method, socket, url } = request;
//         const { remoteAddress, remoteFamily } = socket;

//         const { statusCode, statusMessage } = response;
//         const responseHeaders = response.getHeaders();

//         http.request("https://example.org/logging-endpoint", {
//             headers: loggingApiHeaders,
//             body: JSON.stringify({
//                 timestamp: requestStart,
//                 processingTime: Date.now() - requestStart,
//                 rawHeaders,
//                 body,
//                 errorMessage,
//                 httpVersion,
//                 method,
//                 remoteAddress,
//                 remoteFamily,
//                 url,
//                 response: {
//                     statusCode,
//                     statusMessage,
//                     headers: responseHeaders
//                 }
//             })
//         });
//     };

//     return (request, response) => {
//         const requestStart = Date.now();

//         // ========== REQUEST HANLDING ==========
//         let body = [];
//         let requestErrorMessage = null;
//         const getChunk = chunk => body.push(chunk);
//         const assembleBody = () => {
//             body = Buffer.concat(body).toString();
//         };
//         const getError = error => {
//             requestErrorMessage = error.message;
//         };
//         request.on("data", getChunk);
//         request.on("end", assembleBody);
//         request.on("error", getError);

//         // ========== RESPONSE HANLDING ==========
//         const logClose = () => {
//             removeHandlers();
//             log(request, response, "Client aborted.", requestStart);
//         };
//         const logError = error => {
//             removeHandlers();
//             log(request, response, error.message, requestStart);
//         };
//         const logFinish = () => {
//             removeHandlers();
//             log(request, response, requestErrorMessage, requestStart);
//         };
//         response.on("close", logClose);
//         response.on("error", logError);
//         response.on("finish", logFinish);

//         // ========== CLEANUP ==========
//         const removeHandlers = () => {
//             request.off("data", getChunk);
//             request.off("end", assembleBody);
//             request.off("error", getError);

//             response.off("close", logClose);
//             response.off("error", logError);
//             response.off("finish", logFinish);
//         };
//     };
// };

server.listen(8888, console.log('Listening on ' + 8888));