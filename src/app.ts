/* eslint-disable @typescript-eslint/no-unused-vars */
import express from 'express';
import bodyParser from 'body-parser';
import Logger from "./libs/logger";
import morganMiddleware from './config/morganMiddleware';

import SourceMapper from './libs/sourceMapper';

const PORT = 3000;
const app = express()

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());


try {
    app.use(morganMiddleware);
}
catch(err) {
    throw new Error(err);
}


// try {
    // if (!config.publishSourceMaps) {   //whatever check for prod env
    //     app.use(/(.*)\.js\.map$/, function(req, res) {
    //       res.status(404);
    //       res.send('<h1>404 Forbidden</h1>');
    //     })
    // }
    // //static middleware
    // app.use(staticFileMiddleware);
// }
// catch(err) {
//     throw new Error(err);
// }

let sourceMapper;
try {
    sourceMapper = new SourceMapper();
    sourceMapper.init('./sourcemaps');
    console.log(sourceMapper);
}
catch(err) {
    throw new Error(err);
}


app.get('/logger', (req, res, next) => {
    Logger.error("This is an error log");
    Logger.warn("This is a warn log");
    Logger.info("This is a info log");
    Logger.http("This is a http log");
    Logger.debug("This is a debug log");

    res.send("Hello world");
})

app.get('/boom', (req, res, next) => {
    try {
        throw new Error('Wowza!')
    } catch (error) {
        Logger.error('Whooops! This broke with error: ', error)
        res.status(500).send('Error!')
    }
})

app.get('/errorhandler', (req, res, next) => {
    try {
        throw new Error('Wowza!')
    } catch (error) {
        next(error)
    }
})

app.post('/api/log', (req, res) => {
    console.log('Got log body:', req.body);
    const messageBody = JSON.parse(req.body.message);
    const error = {
        fileName: req.body?.fileName,
        level: req.body?.level,
        lineNumber: req.body?.lineNumber,
        message: messageBody?.message,
        stack: messageBody?.stack,
        timestamp: req.body?.timestamp,
        additional: req.body?.additional,
    }
    console.log(sourceMapper);

    if (error?.stack) {
        const stacktrace = sourceMapper.getOriginalStacktrace(error.stack);
        console.log("🚀 ~ file: app.ts ~ line 92 ~ app.post ~ stacktrace", stacktrace);
        error.stack = stacktrace;
    };
    Logger.info(error);
    res.sendStatus(200);
});

app.use(logErrors)
app.use(errorHandler)

function logErrors(err, req, res, next) {
    console.error(err);
    next(err)
}
function errorHandler(err, req, res, next) {
    res.status(500).send('Error!')
}

app.listen(3000, () => {
    Logger.info(`Server is up and running @ http://localhost:${PORT}`);
    console.log(`Server is up and running @ http://localhost:${PORT}`);
});
