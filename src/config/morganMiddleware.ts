// import morgan, { StreamOptions } from "morgan";
import morgan from "morgan";
import json from 'morgan-json';
import Logger from "../libs/logger";

// // Override the stream method by telling
// // Morgan to use our custom logger instead of the console.log.
// const stream: StreamOptions = {
//     // Use the http severity
//     write: (message) => Logger.http(message),
// };

// // Skip all the Morgan http log if the
// // application is not running in development mode.
// // This method is not really needed here since
// // we already told to the logger that it should print
// // only warning and error messages in production.
// const skip = () => {
//     // eslint-disable-next-line no-undef
//     const env = process.env.NODE_ENV || "development";
//     return env !== "development";
// };

// // Build the morgan middleware
// const morganMiddleware = morgan(
//     // Define message format string (this is the default one).
//     // The message format is made from tokens, and each token is
//     // defined inside the Morgan library.
//     // You can create your custom token to show what do you want from a request.
//     ":method :url :status :res[content-length] - :response-time ms",
//     // Options: in this case, I overwrote the stream and the skip logic.
//     // See the methods above.
//     { stream, skip }
// );

const format = json({
    method: ':method',
    url: ':url',
    status: ':status',
    contentLength: ':res[content-length]',
    responseTime: ':response-time'
})

const morganMiddleware = morgan(format, {
    stream: {
        write: (message) => {
            const {
                method,
                url,
                status,
                contentLength,
                responseTime
            } = JSON.parse(message)

            Logger.info('HTTP Access Log', {
                timestamp: new Date().toString(),
                method,
                url,
                status: Number(status),
                contentLength,
                responseTime: Number(responseTime)
            })
        }
    }
})

export default morganMiddleware;