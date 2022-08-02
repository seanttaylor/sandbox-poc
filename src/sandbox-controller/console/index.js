/* istanbul ignore file */
// Reason: The failed tests are enough during the unit test run. We generally don't need to see the logs. Juice not worth the squeeze.

const shouldLog = process.env.LOG_LEVEL === "debug";

/** 
 * Wraps native console interface; primarily useful for removing log messages from unit and integration test runs. Implements
 * the {@link IConsole} interface that allows us to use a single interface for directing log output. This is a 
 * default sandbox API that is available to *all* client-defined modules.
 * @module Console 
 */

/**
 * A wrapper for native `console.assert` 
 * @param value - an expression that evaluates to TRUE or FALSE
 * @param {String} string
 */
 function assert(value,string) {
    if (shouldLog) {
        console.assert(value, `⚠️ ${string}`);
    }
}

/**
 * A wrapper for native `console.log` 
 * @param {String} string - A string to output
 */
function log(string) {
    if (shouldLog) {
        console.log(string);
        return;
    }
}

/**
 * A wrapper for native `console.error` 
 * @param {Object|String} error
 */
function error(err) {
    if (shouldLog) {
        console.error('ⓧ', err);
    }
}

/**
 * A wrapper for native `console.info` 
 * @param {String} string - A string to output
 */
function info(string) {
    if (shouldLog) {
        console.info(`ℹ︎ ${string}`);
    }
}

/**
 * A wrapper for native `console.warn` 
 * @param {String} string - A string to output
 */
 function warn(string) {
    if (shouldLog) {
        console.warn(`⚠️ ${string}`);
    }
}

export default {
    assert,
    error,
    info,
    log,
    warn,
}