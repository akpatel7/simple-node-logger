import express from 'express';
import logger from './logger';
import httpLogger from './httpLogger';
import bodyParser from 'body-parser';

// import SourceMapper from './utils/sourceMapper';

const app = express()
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
try {
    app.use(httpLogger)
}
catch(err) {
    throw new Error(err);
}

// if (!config.publishSourceMaps) {   //whatever check for prod env
//     app.use(/(.*)\.js\.map$/, function(req, res) {
//       res.status(404);
//       res.send('<h1>404 Forbidden</h1>');
//     })
// }
// //static middleware
// app.use(staticFileMiddleware);

// const sourceMapper = new SourceMapper();
// sourceMapper.init('directory having .js and .js.map');


app.get('/', (req, res) => {
    res.status(200).send('Hello World!')
})

app.get('/boom', (req, res) => {
    try {
        throw new Error('Wowza!')
    } catch (error) {
        logger.error('Whooops! This broke with error: ', error)
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
    // console.log('Got body:', req.body);
    logger.info(req.body);

    //     if (req.body.stack) {
    //         var stacktrace = sourceMapper.getOriginalStacktrace(req.body.stack)
    //     };
    //    //send log to Logstash or whatever

    res.sendStatus(200);
});

app.use(logErrors)
app.use(errorHandler)

function logErrors(err, req, res, next) {
    // console.error(err.stack)
    next(err)
}
function errorHandler(err, req, res) {
    res.status(500).send('Error!')
}

app.listen(3000, () => {
    logger.info('Express.js listening on port 3000.');
    // console.log('Express.js listening on port 3000');
});
