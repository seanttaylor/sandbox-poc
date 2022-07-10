/* istanbul ignore file */
// Reason: The failed tests are enough during the unit test run. We generally don't need to see the logs. Juice not worth the squeeze.

const LOG_CONSOLE_MESSAGES = process.env.LOG_CONSOLE_MESSAGES === "true";

/**
 * @param {String} string
 */
function log(string) {
    if (LOG_CONSOLE_MESSAGES) {
        console.log(string);
        return;
    }
}

/**
 * @param {String} string 
 */
function error(string) {
    if (LOG_CONSOLE_MESSAGES) {
        console.error(string);
        return;
    }
}

/**
 * @param {String} string
 */
function info(string) {
    if (LOG_CONSOLE_MESSAGES) {
        console.info(string);
        return;
    }
}

export default {
    error,
    info,
    log,
}