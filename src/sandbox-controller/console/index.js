/* istanbul ignore file */
// Reason: The failed tests are enough during the unit test run. We generally don't need to see the logs. Juice not worth the squeeze.

const IS_TEST_MODE = process.env.NODE_ENV === 'ci/cd/test'; 

/**
 * @param {String} string
 */
function log(string) {
    if (IS_TEST_MODE) {
        return;
    }
    console.log(string);
}

/**
 * @param {String} string 
 */
function error(string) {
    if (IS_TEST_MODE) {
        return;
    }
    console.error(string);
}

/**
 * @param {String} string
 */
function info(string) {
    if (IS_TEST_MODE) {
        return;
    }
    console.info(string);
}

export default {
    error,
    info,
    log,
}