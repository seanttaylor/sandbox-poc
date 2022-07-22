/* istanbul ignore file */
// Reason: The failed tests are enough during the unit test run. We generally don't need to see the logs. Juice not worth the squeeze.

const shouldLog = process.env.LOG_LEVEL === "debug";

/**
 * @param {String} string
 */
function log(string) {
    if (shouldLog) {
        console.log(string);
        return;
    }
}

/**
 * @param {Object|String} error 
 */
function error(err) {
    if (shouldLog) {
        console.error('ⓧ', err);
    }
}

/**
 * @param {String} string
 */
function info(string) {
    if (shouldLog) {
        console.info(`ℹ︎ ${string}`);
    }
}

/**
 * @param {String} string
 */
 function warn(string) {
    if (shouldLog) {
        console.warn(`⚠️ ${string}`);
    }
}

export default {
    error,
    info,
    log,
    warn,
}