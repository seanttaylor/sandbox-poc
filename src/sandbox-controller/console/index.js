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
 * @param {String} string 
 */
function error(string) {
    if (shouldLog) {
        console.error(string);
        return;
    }
}

/**
 * @param {String} string
 */
function info(string) {
    if (shouldLog) {
        console.info(string);
        return;
    }
}

/**
 * @param {String} string
 */
 function warn(string) {
    if (shouldLog) {
        console.warn(string);
        return;
    }
}

export default {
    error,
    info,
    log,
    warn,
}