/* istanbul ignore file */
// Reason: The failed tests are enough during the unit test run. We generally don't need to see the logs. Juice not worth the squeeze.

const LOG_VERBOSE = process.env.LOG_VERBOSE; 

/**
 * @param {String} string
 */
function log(string) {
    if (LOG_VERBOSE) {
        console.log(string);
        return;
    }
}

/**
 * @param {String} string 
 */
function error(string) {
    if (LOG_VERBOSE) {
        console.error(string);
        return;
    }
}

/**
 * @param {String} string
 */
function info(string) {
    if (LOG_VERBOSE) {
        console.info(string);
        return;
    }
}

export default {
    error,
    info,
    log,
}