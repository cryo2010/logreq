const assert = require('assert');
const onFinished = require('on-finished');

/**
 * Returns a log message string
 * @param {Any} reqId - The value of the request ID, if present (req.id)
 * @param {string} ip - The client IP address
 * @param {string} method - The HTTP request method
 * @param {string} url - The request URL (req.originalUrl)
 * @param {Number} statusCode - The HTTP response code
 * @param {contentLength} - The response content length
 * @param {Object} req - The HTTP request
 * @param {Object} res - The HTTP response
 * @return {string} - A log message
 */
function formatMsg({
  req,
  res,
  reqId,
  ip,
  method,
  url,
  statusCode,
  contentLength,
  ms
}) {
  const id = reqId ? ` (req_id=${reqId})` : '';
  const length = contentLength ? `${contentLength} bytes ` : '';
  return `${ip} ${method} ${url} ${statusCode} ${length}- ${ms} ms${id}`;
}

/**
 * Returns the duration from a given time point until now in milliseconds
 * @param {Number[]} start - The result of a previous call to process.hrtime
 * @return {Number} - The duration from the start in milliseconds
 */
function getDurationInMs(start) {
  const duration = process.hrtime(start);
  const msPerSec = 1e3;
  const nsPerMs = 1e6;
  const ms = duration[0] * msPerSec + Math.floor(duration[1] / nsPerMs);
  return ms;
}

/**
 * Returns a logging middleware function
 * @param {Object} logger - A child logger
 * @param {string="info"} level - (optional) The level at which to log messages
 * @param {Function=} format - (optional) A callback for custom message formats
 * @return - A middleware function
 */
function build({ logger, level = 'info', format = formatMsg }) {
  assert(logger);
  return (req, res, next) => {
    const start = process.hrtime();
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    let message = `${ip} ${req.method} ${req.originalUrl}`;
    onFinished(res, (err, res) => {
      if (!err) {
        const ms = getDurationInMs(start);
        const contentLength = res.get('content-length');
        message = format({
          req,
          res,
          reqId: req.id,
          ip,
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          contentLength,
          ms
        });
        logger[level](message);
      } else {
        logger.error(err);
      }
    });
    next();
  };
}

module.exports = build;
