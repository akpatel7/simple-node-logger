/* eslint-disable */
const morgan = require('morgan');
const json = require('morgan-json');
import * as logger from './logger';
/* eslint-enable */

const format = json({
    method: ':method',
    url: ':url',
    status: ':status',
    contentLength: ':res[content-length]',
    responseTime: ':response-time'
})

const httpLogger = morgan(format, {
    stream: {
        write: (msg) => {
            const {
                method,
                url,
                status,
                contentLength,
                responseTime,
                body,
                message,
                stack
            } = JSON.parse(msg)

            logger.info('HTTP Access Log', {
                timestamp: new Date().toString(),
                method,
                url,
                status: Number(status),
                contentLength,
                responseTime: Number(responseTime),
                body,
                message,
                stack
            })
        }
    }
})

export default httpLogger;